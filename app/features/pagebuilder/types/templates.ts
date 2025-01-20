import type { SettingField } from './settings.js';

export interface TemplateSchema {
  settings: SettingField[];
  blocks?: {
    type: string;
    name: string;
    settings: SettingField[];
  }[];
  max_blocks?: number;
  presets?: {
    name: string;
    settings: Record<string, any>;
    blocks?: Array<{
      type: string;
      settings: Record<string, any>;
    }>;
  }[];
}

export interface SectionDefinition {
  type: string;
  name: string;
  schema: TemplateSchema;
  liquid: string;
  blocks?: {
    [type: string]: {
      name: string;
      schema: TemplateSchema;
      liquid: string;
    }
  };
}

// Registry of available section types
export interface SectionRegistry {
  [type: string]: SectionDefinition;
} 