import type { SettingField } from '../types/shopify.js';
import { AIService } from '~/services/ai/ai.server.js';

interface AIGeneratedBlock {
  type: string;
  settings: Record<string, any>;
  schema: {
    settings: SettingField[];
  };
}

interface AIGeneratedSection {
  type: string;
  settings: Record<string, any>;
  schema: {
    settings: SettingField[];
    blocks?: {
      type: string;
      name: string;
      settings: SettingField[];
    }[];
  };
  blocks?: Record<string, AIGeneratedBlock>;
  block_order?: string[];
}

interface AIGeneratedPage {
  sections: Record<string, AIGeneratedSection>;
  order: string[];
  settings?: {
    seo?: {
      title?: string;
      description?: string;
      url_handle?: string;
    };
  };
}

export class PageBuilderAI {
  private static readonly BASE_PROMPT = `You are a Shopify theme expert that generates complete sections with settings and blocks. 
Generate sections that follow Shopify's best practices for theme development.`;

  private static readonly PAGE_PROMPT = `${PageBuilderAI.BASE_PROMPT}
Each section should include:
- A descriptive type identifier (e.g., 'hero-banner', 'featured-collection')
- Settings schema with appropriate fields
- Initial settings values
- Block definitions if needed

The response should be valid JSON matching Shopify's page.json structure:
{
  "sections": {
    "section-key": {
      "type": "section-type",
      "settings": { setting values },
      "blocks": {
        "block-key": {
          "type": "block-type",
          "settings": { setting values }
        }
      },
      "block_order": ["block-key"],
      "schema": {
        "settings": [{ setting field definitions }],
        "blocks": [{
          "type": "block-type",
          "name": "Block Name",
          "settings": [{ setting field definitions }]
        }]
      }
    }
  },
  "order": ["section-key"]
}`;

  private static getSectionPrompt(type: string): string {
    return `${this.BASE_PROMPT}
Generate a section that follows Shopify's best practices for theme development.
The section type should be "${type}".
Include:
- Settings schema with appropriate fields
- Initial settings values
- Block definitions if needed

The response should be valid JSON matching this structure:
{
  "type": "${type}",
  "settings": { setting values },
  "blocks": {
    "block-key": {
      "type": "block-type",
      "settings": { setting values }
    }
  },
  "block_order": ["block-key"],
  "schema": {
    "settings": [{ setting field definitions }],
    "blocks": [{
      "type": "block-type",
      "name": "Block Name",
      "settings": [{ setting field definitions }]
    }]
  }
}`;
  }

  private static getBlockPrompt(sectionType: string, blockType: string): string {
    return `${this.BASE_PROMPT}
Generate a block for a ${sectionType} section that follows Shopify's best practices.
The block type should be "${blockType}".
Include:
- Settings schema with appropriate fields
- Initial settings values

The response should be valid JSON matching this structure:
{
  "type": "${blockType}",
  "settings": { setting values },
  "schema": {
    "settings": [{ setting field definitions }]
  }
}`;
  }

  static async generatePage(shopId: string, prompt: string): Promise<AIGeneratedPage> {
    const result = await AIService.generate<AIGeneratedPage>(prompt, this.PAGE_PROMPT);
    if (!result.success || !result.data) {
      throw new Error('Failed to generate page');
    }
    return result.data;
  }

  static async generateSection(shopId: string, type: string): Promise<AIGeneratedSection> {
    const result = await AIService.generate<AIGeneratedSection>(type, this.getSectionPrompt(type));
    if (!result.success || !result.data) {
      throw new Error('Failed to generate section');
    }
    return result.data;
  }

  static async generateBlock(shopId: string, sectionType: string, blockType: string): Promise<AIGeneratedBlock> {
    const result = await AIService.generate<AIGeneratedBlock>(blockType, this.getBlockPrompt(sectionType, blockType));
    if (!result.success || !result.data) {
      throw new Error('Failed to generate block');
    }
    return result.data;
  }
} 