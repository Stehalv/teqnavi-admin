import { prisma } from "~/db.server.js";
import { Liquid } from 'liquidjs';
import type { SectionTemplate, BlockTemplate } from '@prisma/client';

export interface TemplateSchema {
  settings: SettingField[];
  blocks?: BlockSchema[];
  presets?: PresetSchema[];
  max_blocks?: number;
}

export interface BlockSchema {
  type: string;
  name: string;
  settings: SettingField[];
}

export interface PresetSchema {
  name: string;
  settings: Record<string, any>;
  blocks?: Array<{
    type: string;
    settings: Record<string, any>;
  }>;
}

export interface SettingField {
  type: string;
  id: string;
  label: string;
  default?: any;
  options?: Array<{
    value: string;
    label: string;
  }>;
}

// Types for API responses (with serialized dates)
export interface BaseTemplate {
  id: string;
  name: string;
  type: string;
  schema: TemplateSchema;
  liquid: string;
  createdAt: string;
  updatedAt: string;
  shopId: string;
}

export interface SerializedTemplate extends BaseTemplate {}

export interface SectionTemplateWithBlocks extends BaseTemplate {
  blocks: BlockTemplateWithSchema[];
}

export interface BlockTemplateWithSchema extends BaseTemplate {
  sectionTemplateId: string;
}

// Function to convert Prisma dates to serialized dates
export function serializeTemplate<T extends SectionTemplate | BlockTemplate>(template: T): SerializedTemplate {
  const parsed = typeof template.schema === 'string' ? JSON.parse(template.schema) : template.schema;
  const base = {
    id: template.id,
    name: template.name,
    type: template.type,
    schema: parsed as TemplateSchema,
    liquid: template.liquid,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString()
  };

  if ('sectionTemplateId' in template) {
    const blockTemplate = template as BlockTemplate & { sectionTemplate?: SectionTemplate };
    return {
      ...base,
      shopId: blockTemplate.sectionTemplate?.shopId || ''
    };
  }

  return {
    ...base,
    shopId: template.shopId
  };
}

// Function to convert a section template with blocks
export function serializeSectionTemplate(template: SectionTemplate & { blocks: BlockTemplate[] }): SectionTemplateWithBlocks {
  return {
    ...serializeTemplate(template),
    blocks: template.blocks.map(block => ({
      ...serializeTemplate(block),
      sectionTemplateId: block.sectionTemplateId,
      shopId: template.shopId
    }))
  };
}

// Function to convert a block template
export function serializeBlockTemplate(template: BlockTemplate & { sectionTemplate: SectionTemplate }): BlockTemplateWithSchema {
  return {
    ...serializeTemplate(template),
    sectionTemplateId: template.sectionTemplateId,
    shopId: template.sectionTemplate.shopId
  };
}

interface TemplateValidation {
  schema: TemplateSchema;
  liquid: string;
}

export class TemplateService {
  private static engine = new Liquid({
    cache: false // Disable cache for validation
  });

  private static convertBlockTemplate(block: any): {
    id: string;
    sectionTemplateId: string;
    name: string;
    type: string;
    schema: TemplateSchema;
    liquid: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      ...block,
      schema: JSON.parse(block.schema) as TemplateSchema
    };
  }

  private static convertSectionTemplate(template: any, blocks?: any[]): SectionTemplateWithBlocks {
    return {
      ...template,
      schema: JSON.parse(template.schema) as TemplateSchema,
      blocks: blocks?.map(this.convertBlockTemplate) || []
    };
  }

  // Section Template Methods
  static async createSectionTemplate(shopId: string, data: {
    name: string;
    type: string;
    schema: TemplateSchema;
    liquid: string;
  }): Promise<SectionTemplateWithBlocks> {
    // Validate the template before saving
    if (!this.validateTemplate({ schema: data.schema, liquid: data.liquid })) {
      throw new Error('Invalid template structure');
    }

    const template = await prisma.sectionTemplate.create({
      data: {
        shopId,
        name: data.name,
        type: data.type,
        schema: JSON.stringify(data.schema),
        liquid: data.liquid
      },
      include: {
        blocks: true
      }
    });

    return this.convertSectionTemplate(template, template.blocks);
  }

  static async updateSectionTemplate(shopId: string, id: string, data: Partial<{
    name: string;
    type: string;
    schema: TemplateSchema;
    liquid: string;
  }>): Promise<SectionTemplateWithBlocks> {
    // If schema or liquid is being updated, validate
    if (data.schema || data.liquid) {
      const template = await this.getSectionTemplate(shopId, id);
      if (!template) throw new Error('Template not found');
      
      const newSchema = data.schema || template.schema;
      const newLiquid = data.liquid || template.liquid;
      
      if (!this.validateTemplate({ schema: newSchema, liquid: newLiquid })) {
        throw new Error('Invalid template structure');
      }
    }

    const updated = await prisma.sectionTemplate.update({
      where: {
        id_shopId: {
          id,
          shopId
        }
      },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.schema && { schema: JSON.stringify(data.schema) }),
        ...(data.liquid && { liquid: data.liquid })
      },
      include: {
        blocks: true
      }
    });

    return this.convertSectionTemplate(updated, updated.blocks);
  }

  static async getSectionTemplate(shopId: string, id: string): Promise<SectionTemplateWithBlocks | null> {
    const template = await prisma.sectionTemplate.findUnique({
      where: {
        id_shopId: {
          id,
          shopId
        }
      },
      include: {
        blocks: true
      }
    });

    if (!template) return null;

    return this.convertSectionTemplate(template, template.blocks);
  }

  static async listSectionTemplates(shopId: string): Promise<SectionTemplateWithBlocks[]> {
    const templates = await prisma.sectionTemplate.findMany({
      where: { shopId },
      include: {
        blocks: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return templates.map(template => serializeSectionTemplate(template));
  }

  static async deleteSectionTemplate(shopId: string, id: string): Promise<void> {
    await prisma.sectionTemplate.delete({
      where: {
        id_shopId: {
          id,
          shopId
        }
      }
    });
  }

  // Block Template Methods
  static async createBlockTemplate(shopId: string, sectionTemplateId: string, data: {
    name: string;
    type: string;
    schema: TemplateSchema;
    liquid: string;
  }): Promise<BlockTemplateWithSchema> {
    // Validate the template before saving
    if (!this.validateTemplate({ schema: data.schema, liquid: data.liquid })) {
      throw new Error('Invalid template structure');
    }

    // Verify section template exists and belongs to shop
    const sectionTemplate = await this.getSectionTemplate(shopId, sectionTemplateId);
    if (!sectionTemplate) {
      throw new Error('Section template not found');
    }

    const created = await prisma.blockTemplate.create({
      data: {
        sectionTemplateId,
        name: data.name,
        type: data.type,
        schema: JSON.stringify(data.schema),
        liquid: data.liquid
      },
      include: {
        sectionTemplate: true
      }
    });

    return serializeBlockTemplate(created);
  }

  static async updateBlockTemplate(shopId: string, id: string, data: Partial<{
    name: string;
    type: string;
    schema: TemplateSchema;
    liquid: string;
  }>): Promise<BlockTemplateWithSchema> {
    const block = await prisma.blockTemplate.findUnique({
      where: { id },
      include: { sectionTemplate: true }
    });

    if (!block || block.sectionTemplate.shopId !== shopId) {
      throw new Error('Block template not found');
    }

    // Validate if schema or liquid is being updated
    if (data.schema || data.liquid) {
      const newSchema = data.schema || JSON.parse(block.schema) as TemplateSchema;
      const newLiquid = data.liquid || block.liquid;
      
      if (!this.validateTemplate({ schema: newSchema, liquid: newLiquid })) {
        throw new Error('Invalid template structure');
      }
    }

    const updated = await prisma.blockTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.schema && { schema: JSON.stringify(data.schema) }),
        ...(data.liquid && { liquid: data.liquid })
      },
      include: {
        sectionTemplate: true
      }
    });

    return serializeBlockTemplate(updated);
  }

  // Template Validation
  private static validateTemplate(template: TemplateValidation): boolean {
    try {
      // Validate schema structure
      if (!template.schema.settings || !Array.isArray(template.schema.settings)) {
        return false;
      }

      // Validate liquid syntax by attempting to parse it
      try {
        this.engine.parse(template.liquid);
      } catch (error) {
        console.error('Liquid syntax error:', error);
        return false;
      }

      // Validate that all schema settings are referenced in the liquid
      const settingIds = (template.schema.settings as SettingField[]).map(s => s.id);
      const unusedSettings = settingIds.filter(id => !template.liquid.includes(`settings.${id}`));
      
      if (unusedSettings.length > 0) {
        console.warn('Unused settings in template:', unusedSettings);
        return false;
      }

      // Validate block schema if present
      if (template.schema.blocks) {
        for (const block of template.schema.blocks) {
          if (!block.type || !block.name || !Array.isArray(block.settings)) {
            console.error('Invalid block schema structure');
            return false;
          }
        }
      }

      // Validate presets if present
      if (template.schema.presets) {
        for (const preset of template.schema.presets) {
          if (!preset.name || typeof preset.settings !== 'object') {
            console.error('Invalid preset structure');
            return false;
          }

          // Validate that preset settings match schema settings
          const invalidSettings = Object.keys(preset.settings)
            .filter(key => !settingIds.includes(key));
          
          if (invalidSettings.length > 0) {
            console.error('Invalid preset settings:', invalidSettings);
            return false;
          }

          // Validate preset blocks if present
          if (preset.blocks) {
            for (const block of preset.blocks) {
              if (!block.type || typeof block.settings !== 'object') {
                console.error('Invalid preset block structure');
                return false;
              }

              // Validate that block type exists in schema
              const blockSchema = template.schema.blocks?.find(b => b.type === block.type);
              if (!blockSchema) {
                console.error('Preset block type not found in schema:', block.type);
                return false;
              }

              // Validate that block settings match schema
              const blockSettingIds = blockSchema.settings.map(s => s.id);
              const invalidBlockSettings = Object.keys(block.settings)
                .filter(key => !blockSettingIds.includes(key));
              
              if (invalidBlockSettings.length > 0) {
                console.error('Invalid preset block settings:', invalidBlockSettings);
                return false;
              }
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Template validation error:', error);
      return false;
    }
  }

  static async listBlockTemplates(shopId: string, sectionType: string) {
    return prisma.blockTemplate.findMany({
      where: {
        sectionTemplate: {
          shopId,
          type: sectionType
        }
      }
    });
  }
} 