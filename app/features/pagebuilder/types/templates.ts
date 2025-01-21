import type { SectionCapabilities, SettingField, BlockTemplate } from './shopify.js';

export interface BlockSchema {
  type: string;
  name: string;
  settings: SettingField[];
}

export interface TemplateSchema {
  name?: string;
  settings: SettingField[];
  blocks?: BlockTemplate[];
  max_blocks?: number;
  capabilities?: SectionCapabilities;
  presets?: Array<{
    name: string;
    settings: Record<string, any>;
    blocks?: Array<{
      type: string;
      settings: Record<string, any>;
    }>;
  }>;
}

export interface SectionDefinition {
  name: string;
  type: string;
  schema: TemplateSchema;
  liquid: string;
  styles?: string;
  settings?: Record<string, any>;
  presets?: Array<{
    name: string;
    settings: Record<string, any>;
    blocks?: Array<{
      type: string;
      settings: Record<string, any>;
    }>;
  }>;
}

export interface SectionLiquidTemplate {
  name: string;
  schema: TemplateSchema;
  liquid: string;
  styles: string;
  blocks?: {
    [type: string]: {
      name: string;
      schema: TemplateSchema;
      liquid: string;
    }
  };
}

// Registry of available section types
export type SectionRegistry = Record<string, SectionDefinition>; 