export interface PageSettings {
  layout: 'full-width' | 'contained';
  spacing: number;
  background: {
    type: 'color' | 'image';
    value: string;
  };
  seo: {
    title: string;
    description: string;
    url_handle: string;
  };
  template_suffix?: string;
}

export interface BlockSettings {
  [key: string]: any;  // Will be typed based on block type
}

export interface Block {
  id: string;
  type: string;
  settings: BlockSettings;
}

export interface SectionSettings {
  [key: string]: any;  // Will be typed based on section type
}

export interface Section {
  id: string;
  type: string;
  settings: SectionSettings;
  blocks: Record<string, Block>;
  block_order: string[];
}

export interface Page {
  id: string;
  shopId: string;
  title: string;
  handle: string;
  template: string;
  sections: Record<string, Section>;
  section_order: string[];
  settings: PageSettings;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageVersion {
  id: string;
  pageId: string;
  version: number;
  sections: Record<string, Section>;
  section_order: string[];
  settings: PageSettings;
  message?: string;
  createdAt: Date;
  createdBy?: string;
  isLatest: boolean;
}

// Section Types
export type SectionType = 'hero' | 'feature' | 'collection' | 'rich-text' | 'image-with-text' | 'newsletter';

// Block Types
export type BlockType = 'text' | 'image' | 'button' | 'product' | 'collection' | 'video'; 