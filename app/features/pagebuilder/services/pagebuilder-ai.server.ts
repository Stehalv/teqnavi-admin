import type { SettingField } from '../types.js';
import { TemplateService } from './template.server.js';
import { AIService } from '~/services/ai/ai.server.js';

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

const PAGE_SYSTEM_PROMPT = `You are a Shopify theme expert that generates complete section templates with liquid code and settings. 
Generate sections that follow Shopify's best practices for theme development.
Each section should include:
- A descriptive name and type
- Complete liquid template code
- Settings schema with appropriate fields
- Initial settings values
- Block templates if needed`;

const PAGE_RESPONSE_EXAMPLE = `{
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
}`;

const SECTION_RESPONSE_EXAMPLE = `{
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
}`;

export class PageBuilderAI {
  static async generatePage(shopId: string, prompt: string) {
    const generatedPage = await AIService.generateFromPrompt<AIGeneratedPage>(
      prompt,
      PAGE_SYSTEM_PROMPT,
      PAGE_RESPONSE_EXAMPLE
    );

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
    const section = await AIService.generateFromPrompt<AIGeneratedSection>(
      prompt,
      PAGE_SYSTEM_PROMPT,
      SECTION_RESPONSE_EXAMPLE.replace('section-type', type)
    );

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