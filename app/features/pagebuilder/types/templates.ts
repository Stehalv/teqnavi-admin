import type { SectionCapabilities, SettingField, BlockTemplate } from './shopify.js';

export interface BlockSchema {
  type: string;
  name: string;
  settings: SettingField[];
}

export interface TemplateSchema {
  name: string;
  settings: SettingField[];
  blocks?: Record<string, BlockTemplate>;
  capabilities: SectionCapabilities;
}

export interface SectionDefinition {
  name: string;
  type: string;
  schema: TemplateSchema;
  liquid: string;
  styles?: string;
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