// Shopify Setting Field Types
export interface SettingField {
  type: string;
  id: string;
  label: string;
  default?: any;
  info?: string;
  placeholder?: string;
  options?: Array<{
    value: string;
    label: string;
  }>;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  settings?: SettingField[]; // For group type settings
}

// Shopify Template Schema
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

// Shopify Block Template
export interface BlockTemplate {
  type: string;
  name: string;
  settings: SettingField[];
  limit?: number;
}

// Shopify Section Template
export interface SectionTemplate {
  name: string;
  type: string;
  settings: SettingField[];
  blocks?: BlockTemplate[];
  max_blocks?: number;
  presets?: Array<{
    name: string;
    settings: Record<string, any>;
    blocks?: Array<{
      type: string;
      settings: Record<string, any>;
    }>;
  }>;
  liquid: string;
}

// Shopify Block Instance
export interface Block {
  type: string;
  settings: Record<string, any>;
}

// Shopify Section Instance
export interface Section {
  type: string;
  settings: Record<string, any>;
  blocks: Record<string, Block>;
  block_order: string[];
}

// Shopify Page JSON Structure
export interface ShopifyPageJSON {
  sections: Record<string, Section>;
  order: string[];
}

// Our Extended Page Model
export interface Page {
  id: string;
  shopId: string;
  title: string;
  handle: string;
  isPublished: boolean;
  data: ShopifyPageJSON;
  templates: Record<string, SectionTemplate>;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  deletedAt?: Date;
}

// Our Page Version Model
export interface PageVersion {
  id: string;
  pageId: string;
  version: number;
  data: ShopifyPageJSON;
  templates: Record<string, SectionTemplate>;
  message?: string;
  createdAt: Date;
  createdBy?: string;
  isLatest: boolean;
}

// Drag and Drop Types
export type DragItemType = 'SECTION' | 'BLOCK';
export type SectionType = 'hero' | 'featured-collection' | 'rich-text' | 'image-with-text' | 'newsletter';
export type BlockType = 'text' | 'image' | 'button' | 'product';

export interface DragItem {
  id: string;
  type: DragItemType;
  index?: number;
  parentId?: string;
}

export interface DropResult {
  id: string;
  type: DragItemType;
  index: number;
  parentId?: string;
}

// UI Wrapper Types for Page Builder
export interface SectionUI extends Section {
  id: string;
  templateId: string;
}

export interface BlockUI extends Block {
  id: string;
  parentId: string;
}

// UI version of Page JSON Structure
export interface ShopifyPageUIJSON {
  sections: Record<string, SectionUI>;
  order: string[];
}

// UI version of Page
export interface PageUI extends Omit<Page, 'data'> {
  data: ShopifyPageUIJSON;
  settings: Record<string, any>;
} 