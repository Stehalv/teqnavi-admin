import { prisma } from "~/db.server.js";
import { Liquid } from 'liquidjs';
import type { SettingField } from '../types/shopify.js';
import type { SectionLiquidTemplate } from '../types/templates.js';
import type { AIGeneratedTemplate } from '../types/ai.js';

export interface TemplateSchema {
  settings: SettingField[];
  blocks?: {
    type: string;
    name: string;
    settings: SettingField[];
  }[];
  max_blocks?: number;
}

export interface SectionDefinition {
  type: string;
  name: string;
  schema: TemplateSchema;
  liquid: string;
  styles: string;
  snippets?: Record<string, string>;  // snippet-id -> liquid code
  settings?: {
    [key: string]: {
      settings: Record<string, any>;
      liquid: string;
    }
  };
  presets?: Array<{
    name: string;
    settings: Record<string, any>;
    blocks?: Array<{
      type: string;
      settings: Record<string, any>;
    }>;
  }>;
  blocks?: {
    [type: string]: {
      name: string;
      schema: TemplateSchema;
      liquid: string;
    }
  };
}

export interface BlockDefinition {
  type: string;
  name: string;
  settings: SettingField[];
}

export class TemplateService {
  private static engine = new Liquid({
    cache: process.env.NODE_ENV === 'production'
  });

  static async saveAIGeneratedTemplate(shopId: string, type: string, template: AIGeneratedTemplate): Promise<void> {
    console.log('Saving AI generated template:', { type, template });

    // Remove schema tag from liquid template
    const liquidWithoutSchema = template.liquid.replace(/{% schema %}[\s\S]*?{% endschema %}/, '').trim();

    const existingTemplate = await prisma.sectionTemplate.findFirst({
      where: {
        shopId,
        type
      }
    });

    // Parse the schema string to get the name and other properties
    const schema = JSON.parse(template.schema);
    const templateData = {
      shopId,
      type,
      name: schema.name || type,
      schema: template.schema,  // Keep as string for storage
      liquid: liquidWithoutSchema,
      styles: template.styles || ''  // Ensure styles is always included with a default empty string
    };

    console.log('Saving template with data:', templateData);

    // Save the template
    if (existingTemplate) {
      await prisma.sectionTemplate.update({
        where: { id: existingTemplate.id },
        data: templateData
      });
    } else {
      await prisma.sectionTemplate.create({
        data: templateData
      });
    }

    // Handle snippets if they exist
    if (template.snippets && Object.keys(template.snippets).length > 0) {
      console.log('Processing snippets:', Object.keys(template.snippets));

      for (const [key, liquid] of Object.entries(template.snippets)) {
        // Check if snippet with same key exists
        const existing = await prisma.snippet.findFirst({
          where: { shopId, key }
        });

        // If exists and liquid is same, skip
        if (existing && existing.liquid === liquid) {
          console.log(`Snippet ${key} already exists with same content, skipping`);
          continue;
        }

        // If exists but liquid is different, generate unique key
        if (existing) {
          let uniqueKey = key;
          let counter = 1;
          let isUnique = false;

          while (!isUnique) {
            uniqueKey = `${key}-${counter}`;
            const exists = await prisma.snippet.findFirst({
              where: { shopId, key: uniqueKey }
            });
            if (!exists) {
              isUnique = true;
            } else {
              counter++;
            }
          }

          console.log(`Snippet ${key} exists with different content, saving as ${uniqueKey}`);
          
          await prisma.snippet.create({
            data: {
              shopId,
              key: uniqueKey,
              name: uniqueKey,
              liquid,
              description: `Generated for section type: ${type}`
            }
          });
        } else {
          // Save new snippet with original key
          console.log(`Creating new snippet: ${key}`);
          
          await prisma.snippet.create({
            data: {
              shopId,
              key,
              name: key,
              liquid,
              description: `Generated for section type: ${type}`
            }
          });
        }
      }
    }
  }

  static async getSectionDefinition(shopId: string, type: string): Promise<SectionDefinition | null> {
    const template = await prisma.sectionTemplate.findFirst({
      where: {
        shopId,
        type
      }
    });

    if (!template) return null;

    const schema = typeof template.schema === 'string' ? JSON.parse(template.schema) : template.schema;
    const settings = template.settings ? JSON.parse(template.settings) : undefined;

    return {
      type: template.type,
      name: template.name,
      schema,
      liquid: template.liquid,
      styles: template.styles,
      snippets: {},  // Return empty snippets object
      settings
    };
  }

  static async listSectionDefinitions(shopId: string): Promise<SectionDefinition[]> {
    const templates = await prisma.sectionTemplate.findMany({
      where: {
        shopId
      }
    });

    return templates.map(template => {
      const schema = typeof template.schema === 'string' ? JSON.parse(template.schema) : template.schema;
      const settings = template.settings ? JSON.parse(template.settings) : undefined;

      return {
        type: template.type,
        name: template.name,
        schema,
        liquid: template.liquid,
        styles: template.styles,
        snippets: {},  // Return empty snippets object
        settings
      };
    });
  }

  static async listBlockDefinitions(shopId: string, sectionType: string): Promise<BlockDefinition[]> {
    const template = await prisma.sectionTemplate.findFirst({
      where: {
        shopId,
        type: sectionType
      }
    });

    if (!template) return [];

    const schema = typeof template.schema === 'string' ? JSON.parse(template.schema) : template.schema;
    return schema.blocks || [];
  }

  static async validateSchema(schema: TemplateSchema): Promise<boolean> {
    try {
      // Validate settings
      if (!Array.isArray(schema.settings)) {
        return false;
      }

      for (const setting of schema.settings) {
        if (!setting.type || !setting.id || !setting.label) {
          return false;
        }
      }

      // Validate blocks if present
      if (schema.blocks) {
        if (!Array.isArray(schema.blocks)) {
          return false;
        }

        for (const block of schema.blocks) {
          if (!block.type || !block.name || !Array.isArray(block.settings)) {
            return false;
          }

          for (const setting of block.settings) {
            if (!setting.type || !setting.id || !setting.label) {
              return false;
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Schema validation error:', error);
      return false;
    }
  }
} 