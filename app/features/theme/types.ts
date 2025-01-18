// Convert Date objects to strings when serializing to JSON
export type JsonifyObject<T> = {
  [P in keyof T]: T[P] extends Date ? string : T[P];
};

// Core database type
export interface ThemeAsset {
  id: string;
  shopId: string;
  name: string;
  type: string;
  handle?: string | null;
  content: string;
  template_format: string;
  isActive: boolean;
  settings: string;  // JSON string in database
  renderedHtml?: string | null;
  html?: string | null;
  createdAt: Date;
  updatedAt: Date;
  sectionId?: string | null;
}

// Type for assets in the application after processing
export interface ProcessedAsset {
  id: string;
  shopId: string;
  name: string;
  type: string;
  handle?: string | null;
  content: string;
  template_format: string;
  isActive: boolean;
  settings: Record<string, any>;  // Parsed JSON
  renderedHtml?: string | null;
  html?: string | null;
  createdAt: string;  // ISO string
  updatedAt: string;  // ISO string
  source: 'section' | 'custom' | 'common';
  sectionId?: string | null;
}

// Types for settings
export interface SettingSchema {
  name: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'richtext' | 'range';
  id: string;
  label: string;
  default?: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface SettingValue {
  id: string;
  value: any;
}

// Types for page content structure
export interface Block {
  id: string;
  type: string;
  settings: Record<string, any>;
  sectionId?: string;
}

export interface Section {
  id: string;
  type: string;
  settings: Record<string, any>;
  blocks?: Block[];
} 