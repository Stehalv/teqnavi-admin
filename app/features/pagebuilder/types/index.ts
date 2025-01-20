export * from './shopify.js';

// Legacy types - to be removed after migration
export interface LegacyBlock {
  id: string;
  type: string;
  settings: Record<string, any>;
}

export interface LegacySection {
  id: string;
  templateId: string;
  type: string;
  settings: Record<string, any>;
  blocks: Record<string, LegacyBlock>;
  block_order: string[];
}

export interface LegacyPage {
  id: string;
  shopId: string;
  title: string;
  handle: string;
  template: string;
  sections: LegacySection[];
  section_order: string[];
  settings: Record<string, any>;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  version?: number;
  publishedAt?: Date;
  deletedAt?: Date;
} 