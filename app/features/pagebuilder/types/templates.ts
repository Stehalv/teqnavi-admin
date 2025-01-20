import type { SettingField } from './settings.js';

export interface BaseTemplate {
  id: string;
  shopId: string;
  name: string;
  type: string;
  schema: object;
  liquid: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SectionTemplate extends BaseTemplate {
  blocks: BlockTemplate[];
}

export interface BlockTemplate extends BaseTemplate {
  sectionTemplateId: string;
}

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