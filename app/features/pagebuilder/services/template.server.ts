import { prisma } from "~/db.server.js";
import { Liquid } from 'liquidjs';
import type { SettingField } from '../types/shopify.js';

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
  presets?: Array<{
    name: string;
    settings: Record<string, any>;
    blocks?: Array<{
      type: string;
      settings: Record<string, any>;
    }>;
  }>;
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

  static async getSectionDefinition(shopId: string, type: string): Promise<SectionDefinition | null> {
    const template = await prisma.sectionTemplate.findFirst({
      where: {
        shopId,
        type
      }
    });

    if (!template) return null;

    const schema = typeof template.schema === 'string' ? JSON.parse(template.schema) : template.schema;
    return {
      type: template.type,
      name: template.name,
      schema
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
      return {
        type: template.type,
        name: template.name,
        schema
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