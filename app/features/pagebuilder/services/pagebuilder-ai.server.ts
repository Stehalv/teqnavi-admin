import { OpenAI } from 'openai';
import type { AIGeneratedTemplate, AIGeneratedPage } from '../types/ai.js';
import type { SettingField, SectionTemplate, BlockTemplate, TemplateSchema, SectionCapabilities } from '../types/shopify.js';
import { TemplateService } from './template.server.js';
import { PageService } from './page.server.js';

export interface SectionLiquidTemplate {
  name: string;
  schema: TemplateSchema;
  liquid: string;
  styles: string;
}

interface GeneratedSection {
  type: string;
  settings: Record<string, any>;
  blocks?: {
    [key: string]: {
      type: string;
      settings: Record<string, any>;
    }
  };
  block_order?: string[];
}

export class PageBuilderAI {
  static readonly MODEL = "gpt-4-turbo-preview";
  private static readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  static readonly PAGE_PROMPT = `Generate a Shopify page JSON that MUST follow this EXACT structure:
{
  "name": "Page Name",
  "sections": {
    "section-id": { 
      "type": "section-type",
      "settings": {
        // IMPORTANT: All settings must use underscores, not hyphens. Examples:
        "text_color": "#000000",       // ✅ Use text_color, not text-color
        "font_size": "16px",          // ✅ Use font_size, not font-size
        "title_font_size": "24px",    // ✅ Use title_font_size, not title-font-size
        "padding_top": "40",          // ✅ Use padding_top, not padding-top
        "padding_bottom": "40",       // ✅ Use padding_bottom, not padding-bottom
        "background_color": "#ffffff" // ✅ Use background_color, not background-color
      }
    }
  },
  "order": ["section-id"]
}

The response MUST be valid JSON and MUST include the "sections" object.
1. A descriptive name for the page
2. A well-structured layout with sections that follow e-commerce best practices
3. Each section should have fully configured settings for:
   - Typography (using flat keys with underscores like text_color, font_size)
   - Spacing and padding (using underscores like padding_top)
   - Responsive behavior (mobile/desktop)
   - Background styling (using underscores like background_color)
   - Content alignment and width
4. Blocks within sections where appropriate
5. If your template requires reusable components, create them as snippets.
6. SEO-friendly content structure
7. Accessibility considerations
8. Performance optimizations (lazy loading, etc)

The page should follow modern e-commerce design patterns and be optimized for conversions.
Include settings that control all visual elements and user interactions.

IMPORTANT: 
- Sections MUST be an object with IDs as keys, not an array.
- All settings MUST be flat, not nested in objects like typography or styles.
- ALL setting names MUST use underscores (_) not hyphens (-).
- Follow Shopify naming conventions (e.g., text_color, font_size, padding_top)`;

  static readonly TEMPLATE_PROMPT = `Generate a Shopify section template JSON that follows this exact structure:
{
  "name": "Section Name",
  "schema": {
    "settings": [
      {
        "type": "text|image_picker|select|radio|checkbox|range|color|richtext",
        "id": "setting_id",     // MUST use underscores, not hyphens
        "label": "Setting Label",
        "default": "default value"
      }
    ],
    "blocks": [
      {
        "type": "block_type",
        "name": "Block Name",
        "settings": [
          {
            "type": "text",
            "id": "text_color",  // Example of correct underscore naming
            "label": "Text Color",
            "default": "#000000"
          }
        ]
      }
    ]
  },
  "liquid": "{% comment %}Section template code{% endcomment %}",
  "styles": "
    /* Section CSS */
    .section-name {
      /* Base styles */
      --section-padding: {{ settings.padding_top }}px;  // Note underscore in setting name
      --text-color: {{ settings.text_color }};         // Note underscore in setting name
      
      padding: var(--section-padding) 0;
      color: var(--text-color);
  }"
}

The template should:
1. Use semantic HTML in the liquid code
2. Include responsive styles with mobile-first approach
3. Use CSS custom properties for theme settings
4. Follow BEM naming convention for CSS classes
5. Optimize for performance
6. Include hover states and smooth transitions
7. Support dynamic content from settings using their IDs
8. Ensure accessibility
9. Use modern CSS features
10. Include print styles where appropriate

IMPORTANT: ALL setting IDs must use underscores (_) not hyphens (-). Examples:
- ✅ text_color
- ✅ font_size
- ✅ padding_top
- ✅ background_color
- ❌ text-color
- ❌ font-size
- ❌ padding-top
- ❌ background-color`;

  private static readonly cleanJsonResponse = (content: string): string => {
    // Extract just the JSON part from the response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      // If no markdown code blocks, try to find just the JSON object
      const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
      return jsonObjectMatch ? jsonObjectMatch[0].trim() : content.trim();
    }
    
    const jsonContent = jsonMatch[1].trim();
    
    // Find the liquid template and normalize its line breaks if present
    return jsonContent.replace(/("liquid":\s*")([^"]+)(")/g, (match, p1, p2, p3) => {
      // Replace all newlines with \n and normalize spaces
      const normalizedTemplate = p2
        .replace(/\n\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return p1 + normalizedTemplate + p3;
    });
  }

  static getPagePrompt(): string {
    return this.PAGE_PROMPT;
  }

  static getTemplatePrompt(): string {
    return this.TEMPLATE_PROMPT;
  }

  static validateTemplate(template: any): void {
    // Move validation logic from private to public
    if (!template.schema || !template.liquid) {
      throw new Error('Template must include schema and liquid');
    }

    // Validate styles
    if (typeof template.styles !== 'string') {
      throw new Error('Template styles must be a string');
    }

    // Validate snippets
    if (template.snippets) {
      if (typeof template.snippets !== 'object') {
        throw new Error('Template snippets must be an object');
      }
      Object.entries(template.snippets).forEach(([id, code]) => {
        if (typeof code !== 'string') {
          throw new Error(`Snippet ${id} must contain string liquid code`);
        }
      });
    }

    if (!Array.isArray(template.schema.settings)) {
      throw new Error('Schema must include settings array');
    }

    template.schema.settings.forEach((setting: SettingField) => {
      if (!setting.type || !setting.id || !setting.label) {
        throw new Error('Each setting must have type, id, and label');
      }
    });

    if (template.schema.blocks) {
      if (!Array.isArray(template.schema.blocks)) {
        throw new Error('Blocks must be an array');
      }

      template.schema.blocks.forEach((block: BlockTemplate) => {
        if (!block.type || !block.name || !Array.isArray(block.settings)) {
          throw new Error('Each block must have type, name, and settings array');
        }

        block.settings.forEach((setting: SettingField) => {
          if (!setting.type || !setting.id || !setting.label) {
            throw new Error('Each block setting must have type, id, and label');
          }
        });
      });
    }
  }

  static async generatePage(shopId: string, prompt: string): Promise<AIGeneratedPage> {
    try {
      // Generate page JSON with sections
      const pageResponse = await this.openai.chat.completions.create({
        model: this.MODEL,
        messages: [
          { role: "system", content: this.PAGE_PROMPT },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000
      });

      const pageJson = pageResponse.choices[0]?.message?.content;
      if (!pageJson) throw new Error("Failed to generate page");

      console.log('AI Response:', pageJson);
      
      try {
        // Parse page to get section types
        const rawPage = JSON.parse(pageJson);
        console.log('Parsed page object:', rawPage);

        if (!rawPage.sections) {
          throw new Error('Generated page must include sections array');
        }

        // Convert array of sections to object with generated IDs
        const sections: Record<string, any> = {};
        const order: string[] = [];
        
        if (typeof rawPage.sections === 'object' && !Array.isArray(rawPage.sections)) {
          // Sections are already in the correct format
          Object.entries(rawPage.sections).forEach(([id, section]: [string, any]) => {
            if (!section.type) {
              console.error('Invalid section:', section);
              throw new Error('Each section must have a type');
            }
            sections[id] = section;
          });
          
          // Use provided order or create from section keys
          order.push(...(rawPage.order || Object.keys(rawPage.sections)));
        } else {
          console.error('Invalid sections format:', rawPage.sections);
          throw new Error('Sections must be an object');
        }

        // Create the normalized page structure
        const page = {
          name: rawPage.name || "Untitled Page",
          sections,
          order,
          settings: rawPage.settings || {}
        };
        
        console.log('Normalized page structure:', page);
        
        const templates: Record<string, AIGeneratedTemplate> = {};

        // Generate template for each unique section type
        const uniqueTypes = new Set(Object.values(sections).map(s => s.type));
        console.log('Unique section types:', Array.from(uniqueTypes));
        
        for (const type of uniqueTypes) {
          try {
            console.log(`Checking for existing template for ${type}...`);
            // First check if we already have this template
            const existingTemplate = await TemplateService.getSectionDefinition(shopId, type);
            
            if (existingTemplate) {
              console.log(`Using existing template for ${type}`);
              templates[type] = {
                schema: JSON.stringify(existingTemplate.schema),
                liquid: existingTemplate.liquid,
                styles: existingTemplate.styles || '',
                snippets: {},
                sections: {}
              };
              continue;
            }

            console.log(`Generating new template for ${type}...`);
            const template = await this.generateSectionTemplate(type, sections);
            templates[type] = template;
            
            // Save the template to the database
            await TemplateService.saveAIGeneratedTemplate(shopId, type, template);
          } catch (error) {
            console.error(`Error handling template for ${type}:`, error);
            throw new Error(`Failed to handle template for ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        // Create the page in the database with the AI-generated name
        const createdPage = await PageService.createPage(shopId, {
          title: page.name,
          data: page
        });

        return {
          templates,
          page: JSON.stringify(page)
        };
      } catch (error) {
        console.error('Error parsing or processing page JSON:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          rawResponse: pageJson
        });
        throw error;
      }
    } catch (error) {
      console.error('Error in generatePage:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  private static async generateSectionTemplate(type: string, sections: Record<string, GeneratedSection>): Promise<AIGeneratedTemplate> {
    const exampleSection = Object.values(sections).find((s) => s.type === type);
    
    if (!exampleSection?.settings) {
      console.warn(`No example section found for type ${type}, generating generic template`);
    }
    
    const sectionPrompt = `Generate a template for a ${type} section that implements these settings:
${JSON.stringify(exampleSection?.settings || {}, null, 2)}

${exampleSection?.blocks ? `And these blocks:
${JSON.stringify(exampleSection.blocks, null, 2)}` : ''}`;

    const response = await this.openai.chat.completions.create({
      model: this.MODEL,
      messages: [
        { role: "system", content: this.TEMPLATE_PROMPT },
        { role: "user", content: sectionPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const templateJson = response.choices[0]?.message?.content;
    if (!templateJson) throw new Error(`Failed to generate template for ${type}`);

    try {
      const template = JSON.parse(templateJson);
      this.validateTemplate(template);

      // Convert to AIGeneratedTemplate format
      const sectionInstances: Record<string, { settings: Record<string, any>; liquid: string; blocks?: any; block_order?: string[] }> = {};
      
      // Populate section instances from the sections parameter
      Object.entries(sections)
          .filter(([_, section]) => section.type === type)
          .forEach(([key, section]) => {
              sectionInstances[key] = {
                  settings: section.settings,
                  liquid: template.liquid,
                  blocks: section.blocks,
                  block_order: section.block_order
              };
          });

      return {
          schema: JSON.stringify(template.schema),
          liquid: template.liquid,
          styles: template.styles || '',
          snippets: template.snippets || {},
          sections: sectionInstances
      };
    } catch (error) {
      console.error(`Error parsing template for ${type}:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        rawResponse: templateJson
      });
      throw new Error(`Failed to parse template JSON for ${type}`);
    }
  }

  static async generateSection(type: string): Promise<AIGeneratedTemplate> {
    return this.generateSectionTemplate(type, {});
  }

  static async generateBlock(type: string, sectionType: string): Promise<AIGeneratedTemplate> {
    const blockPrompt = `Generate a Shopify block template for a ${type} block that will be used within a ${sectionType} section. Include:
1. Appropriate settings for the block type
2. Semantic HTML structure
3. Responsive behavior
4. Accessibility features
5. Performance optimizations`;

    const response = await this.openai.chat.completions.create({
      model: this.MODEL,
      messages: [
        { role: "system", content: this.TEMPLATE_PROMPT },
        { role: "user", content: blockPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
    });

    const templateJson = response.choices[0]?.message?.content;
    if (!templateJson) throw new Error(`Failed to generate block template for ${type}`);

    const template = JSON.parse(templateJson);
    this.validateTemplate(template);

    return {
      schema: JSON.stringify(template.schema),
      liquid: template.liquid,
      styles: template.styles || '',
      snippets: template.snippets || {},
      sections: {}
    };
  }
}