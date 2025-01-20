import { OpenAI } from 'openai';
import type { SettingField } from '../types.js';
import { TemplateService } from './template.server.js';

interface AIGeneratedBlock {
  type: string;
  name: string;
  settings: Record<string, any>;
  schema: {
    settings: SettingField[];
  };
  liquid: string;
}

interface AIGeneratedSection {
  type: string;
  name: string;
  settings: Record<string, any>;
  schema: {
    settings: SettingField[];
  };
  liquid: string;
  blocks: AIGeneratedBlock[];
}

interface AIGeneratedPage {
  title: string;
  sections: AIGeneratedSection[];
  settings: {
    seo: {
      title: string;
      description: string;
      url_handle: string;
    };
  };
}

export class AIService {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  static async generatePage(shopId: string, prompt: string) {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Shopify theme expert that generates complete section templates with liquid code and settings. 
          Generate sections that follow Shopify's best practices for theme development.
          Each section should include:
          - A descriptive name and type
          - Complete liquid template code
          - Settings schema with appropriate fields
          - Initial settings values
          - Block templates if needed
          
          The response should be valid JSON matching this structure:
          {
            "title": "Page Title",
            "sections": [{
              "type": "section-type",
              "name": "Section Name",
              "settings": { setting values },
              "schema": {
                "settings": [{ setting field definitions }]
              },
              "liquid": "{% liquid template code %}",
              "blocks": [{
                "type": "block-type",
                "name": "Block Name",
                "settings": { setting values },
                "schema": {
                  "settings": [{ setting field definitions }]
                },
                "liquid": "{% liquid block template %}"
              }]
            }],
            "settings": {
              "seo": {
                "title": "SEO Title",
                "description": "SEO Description",
                "url_handle": "page-url"
              }
            }
          }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const generatedPage = JSON.parse(response) as AIGeneratedPage;

    // Create sections and blocks in parallel
    const sectionPromises = generatedPage.sections.map(async (section) => {
      // Create section template
      const sectionTemplate = await TemplateService.createSectionTemplate(shopId, {
        name: section.name,
        type: section.type,
        schema: section.schema,
        liquid: section.liquid
      });

      // Create block templates
      const blockPromises = section.blocks.map(block => 
        TemplateService.createBlockTemplate(shopId, sectionTemplate.id, {
          name: block.name,
          type: block.type,
          schema: block.schema,
          liquid: block.liquid
        })
      );

      await Promise.all(blockPromises);

      return {
        template: sectionTemplate,
        section
      };
    });

    const results = await Promise.all(sectionPromises);

    return {
      templates: results,
      settings: generatedPage.settings
    };
  }

  static async generateSection(shopId: string, prompt: string, type: string) {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Shopify theme expert that generates complete section templates with liquid code and settings. 
          Generate sections that follow Shopify's best practices for theme development.
          Each section should include:
          - A descriptive name and type
          - Complete liquid template code
          - Settings schema with appropriate fields
          - Initial settings values
          - Block templates if needed
          
          The response should be valid JSON matching this structure:
          {
            "type": "${type}",
            "name": "Section Name",
            "settings": { setting values },
            "schema": {
              "settings": [{ setting field definitions }]
            },
            "liquid": "{% liquid template code %}",
            "blocks": [{
              "type": "block-type",
              "name": "Block Name",
              "settings": { setting values },
              "schema": {
                "settings": [{ setting field definitions }]
              },
              "liquid": "{% liquid block template %}"
            }]
          }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const section = JSON.parse(response) as AIGeneratedSection;

    // Create section template
    const sectionTemplate = await TemplateService.createSectionTemplate(shopId, {
      name: section.name,
      type: section.type,
      schema: section.schema,
      liquid: section.liquid
    });

    // Create block templates
    const blockPromises = section.blocks.map(block => 
      TemplateService.createBlockTemplate(shopId, sectionTemplate.id, {
        name: block.name,
        type: block.type,
        schema: block.schema,
        liquid: block.liquid
      })
    );

    await Promise.all(blockPromises);

    return {
      template: sectionTemplate,
      section
    };
  }
} 