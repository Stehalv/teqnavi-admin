import { PageBuilderAI } from "../features/pagebuilder/services/pagebuilder-ai.server.js";
import { TemplateService } from "../features/pagebuilder/services/template.server.js";
import { PageService } from "../features/pagebuilder/services/page.server.js";
import { nanoid } from 'nanoid';
import { OpenAI } from 'openai';

export interface JobProgress {
  stage: string;
  message: string;
  timestamp: Date;
}

export interface Job {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: JobProgress[];
  data?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class JobQueue {
  private static readonly jobs = new Map<string, Job>();
  private static readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  static createJob(): string {
    const jobId = nanoid();
    this.jobs.set(jobId, {
      id: jobId,
      status: 'pending',
      progress: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return jobId;
  }

  private static addProgress(jobId: string, stage: string, message: string) {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    job.progress.push({
      stage,
      message,
      timestamp: new Date()
    });
    job.updatedAt = new Date();
    this.jobs.set(jobId, job);

    console.log(`[Job ${jobId}] ${stage}: ${message}`);
  }

  static async startPageGeneration(jobId: string, shopId: string, prompt: string) {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    try {
      job.status = 'processing';
      job.updatedAt = new Date();
      this.jobs.set(jobId, job);

      // Request page from AI
      this.addProgress(jobId, 'AI Request', 'Requesting page structure from OpenAI...');
      const pageResponse = await this.openai.chat.completions.create({
        model: PageBuilderAI.MODEL,
        messages: [
          { role: "system", content: PageBuilderAI.PAGE_PROMPT },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000
      });

      const pageJson = pageResponse.choices[0]?.message?.content;
      if (!pageJson) throw new Error("Failed to generate page");

      this.addProgress(jobId, 'AI Response', 'Received page structure from OpenAI');
      
      // Parse page to get section types
      this.addProgress(jobId, 'Processing', 'Parsing page structure...');
      const rawPage = JSON.parse(pageJson);

      if (!rawPage.sections) {
        throw new Error('Generated page must include sections array');
      }

      // Process sections
      this.addProgress(jobId, 'Sections', 'Validating section structure...');
      const sections: Record<string, any> = {};
      const order: string[] = [];
      
      if (typeof rawPage.sections === 'object' && !Array.isArray(rawPage.sections)) {
        Object.entries(rawPage.sections).forEach(([id, section]: [string, any]) => {
          if (!section.type) {
            throw new Error('Each section must have a type');
          }
          sections[id] = section;
          this.addProgress(jobId, 'Section', `Found section: ${section.type} (${id})`);
        });
        
        order.push(...(rawPage.order || Object.keys(rawPage.sections)));
      } else {
        throw new Error('Sections must be an object');
      }

      // Create the normalized page structure
      const page = {
        name: rawPage.name || "Untitled Page",
        sections,
        order,
        settings: rawPage.settings || {}
      };
      
      this.addProgress(jobId, 'Templates', 'Starting template generation...');
      const templates: Record<string, any> = {};

      // Generate template for each unique section type
      const uniqueTypes = new Set(Object.values(sections).map(s => s.type));
      this.addProgress(jobId, 'Templates', `Found ${uniqueTypes.size} unique section types`);
      
      for (const type of uniqueTypes) {
        try {
          this.addProgress(jobId, 'Template', `Processing template for: ${type}`);
          const existingTemplate = await TemplateService.getSectionDefinition(shopId, type);
          
          if (existingTemplate) {
            this.addProgress(jobId, 'Template', `Using existing template for: ${type}`);
            
            // Find all sections of this type and create instances
            const sectionInstances: Record<string, any> = {};
            const sectionsOfType = Object.entries(sections).filter(([_, section]) => section.type === type);
            
            this.addProgress(jobId, 'Template', `Found ${sectionsOfType.length} instances of ${type}`);
            
            for (const [id, section] of sectionsOfType) {
              sectionInstances[id] = {
                settings: section.settings || {},
                blocks: section.blocks || {},
                block_order: section.block_order || [],
                liquid: existingTemplate.liquid
              };
            }

            templates[type] = {
              schema: JSON.stringify(existingTemplate.schema),
              liquid: existingTemplate.liquid,
              sections: sectionInstances
            };
            continue;
          }

          this.addProgress(jobId, 'Template', `Generating new template for: ${type}`);
          const template = await this.generateSectionTemplate(jobId, type, sections);
          templates[type] = template;
          
          this.addProgress(jobId, 'Template', `Saving template for: ${type}`);
          await TemplateService.saveAIGeneratedTemplate(shopId, type, template);
        } catch (error) {
          throw new Error(`Failed to handle template for ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Create the page in the database
      this.addProgress(jobId, 'Database', 'Creating page in database...');
      const handle = await PageService.generateUniqueHandle(shopId, page.name);
      console.log('Creating page with data:', {
        title: page.name,
        data: {
          sections: page.sections,
          order: page.order,
          settings: page.settings
        },
        handle
      });
      const createdPage = await PageService.createPage(shopId, {
        title: page.name,
        data: {
          sections: page.sections,
          order: page.order,
          settings: page.settings
        },
        handle
      });

      this.addProgress(jobId, 'Complete', 'Page generation completed successfully');
      
      // Update job with success
      this.jobs.set(jobId, {
        ...job,
        status: 'completed',
        data: {
          rawResponse: pageJson,
          page: JSON.stringify(page),
          templates
        },
        updatedAt: new Date()
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.addProgress(jobId, 'Error', `Generation failed: ${errorMessage}`);
      
      // Update job with error
      this.jobs.set(jobId, {
        ...job,
        status: 'error',
        error: errorMessage,
        updatedAt: new Date()
      });
    }
  }

  private static async generateSectionTemplate(jobId: string, type: string, sections: Record<string, any>): Promise<any> {
    const exampleSection = Object.values(sections).find((s) => s.type === type);
    
    this.addProgress(jobId, 'Template', `Preparing template prompt for: ${type}`);
    const sectionPrompt = `Generate a template for a ${type} section that implements these settings:
${JSON.stringify(exampleSection?.settings || {}, null, 2)}

${exampleSection?.blocks ? `And these blocks:
${JSON.stringify(exampleSection.blocks, null, 2)}` : ''}`;

    this.addProgress(jobId, 'Template', `Requesting template from OpenAI: ${type}`);
    const response = await this.openai.chat.completions.create({
      model: PageBuilderAI.MODEL,
      messages: [
        { role: "system", content: PageBuilderAI.TEMPLATE_PROMPT },
        { role: "user", content: sectionPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const templateJson = response.choices[0]?.message?.content;
    if (!templateJson) throw new Error(`Failed to generate template for ${type}`);

    this.addProgress(jobId, 'Template', `Validating template for: ${type}`);
    const template = JSON.parse(templateJson);
    PageBuilderAI.validateTemplate(template);

    this.addProgress(jobId, 'Template', `Processing template instances for: ${type}`);
    
    // Find all sections of this type and create instances
    const sectionInstances: Record<string, any> = {};
    const sectionsOfType = Object.entries(sections).filter(([_, section]) => section.type === type);
    
    this.addProgress(jobId, 'Template', `Found ${sectionsOfType.length} instances of ${type}`);
    
    for (const [id, section] of sectionsOfType) {
      sectionInstances[id] = {
        settings: section.settings || {},
        blocks: section.blocks || {},
        block_order: section.block_order || [],
        liquid: template.liquid
      };
    }

    return {
      schema: JSON.stringify(template.schema),
      liquid: template.liquid,
      sections: sectionInstances
    };
  }

  static getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  static cleanupOldJobs() {
    const ONE_HOUR = 60 * 60 * 1000;
    const now = new Date().getTime();

    for (const [jobId, job] of this.jobs.entries()) {
      if (now - job.createdAt.getTime() > ONE_HOUR) {
        this.jobs.delete(jobId);
      }
    }
  }
} 