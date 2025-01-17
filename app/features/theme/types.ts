// Convert Date objects to strings when serializing to JSON
export type JsonifyObject<T> = {
  [P in keyof T]: T[P] extends Date ? string : T[P];
};

export interface ThemeAsset {
  id: string;
  shopId: string;
  type: string;
  name: string;
  handle?: string;
  content: string;
  settings: string;
  template_format: string;
  isActive: boolean;
  renderedHtml?: string;
  html?: string;
  createdAt: Date;
  updatedAt: Date;
  source?: 'app' | 'section' | 'custom';
}

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