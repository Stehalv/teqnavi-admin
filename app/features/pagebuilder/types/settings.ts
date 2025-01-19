export interface HSBAColor {
  hue: number;
  saturation: number;
  brightness: number;
  alpha?: number;
}

export interface BaseSettingField {
  key: string;
  label: string;
  helpText?: string;
  required?: boolean;
  defaultValue?: any;
}

// Basic Inputs
export interface CheckboxField extends BaseSettingField {
  type: 'checkbox';
  labelOn?: string;
  labelOff?: string;
}

export interface NumberField extends BaseSettingField {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface RadioField extends BaseSettingField {
  type: 'radio';
  options: Array<{ label: string; value: string }>;
}

export interface RangeField extends BaseSettingField {
  type: 'range';
  min: number;
  max: number;
  step: number;
  unit?: string;
  suffix?: string;
}

export interface SelectField extends BaseSettingField {
  type: 'select';
  options: Array<{ label: string; value: string }>;
}

export interface TextField extends BaseSettingField {
  type: 'text';
  multiline?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export interface TextAreaField extends BaseSettingField {
  type: 'textarea';
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}

// Resource Pickers
export interface ArticleField extends BaseSettingField {
  type: 'article';
  blogId?: string;
}

export interface BlogField extends BaseSettingField {
  type: 'blog';
}

export interface CollectionField extends BaseSettingField {
  type: 'collection';
}

export interface CollectionListField extends BaseSettingField {
  type: 'collection_list';
  max?: number;
}

export interface PageField extends BaseSettingField {
  type: 'page';
}

export interface ProductField extends BaseSettingField {
  type: 'product';
}

export interface ProductListField extends BaseSettingField {
  type: 'product_list';
  max?: number;
}

// Color Inputs
export interface ColorField extends BaseSettingField {
  type: 'color';
  allowAlpha?: boolean;
}

export interface ColorBackgroundField extends BaseSettingField {
  type: 'color_background';
  allowAlpha?: boolean;
  allowGradient?: boolean;
}

export interface ColorSchemeField extends BaseSettingField {
  type: 'color_scheme';
  options: Array<{ label: string; value: string; colors: HSBAColor[] }>;
}

export interface ColorSchemeGroupField extends BaseSettingField {
  type: 'color_scheme_group';
  schemes: ColorSchemeField[];
}

// Media Inputs
export interface ImagePickerField extends BaseSettingField {
  type: 'image_picker';
  maxSize?: number;
  allowedTypes?: string[];
  aspectRatio?: number;
}

export interface VideoField extends BaseSettingField {
  type: 'video';
  maxSize?: number;
  allowedTypes?: string[];
}

export interface VideoUrlField extends BaseSettingField {
  type: 'video_url';
  accept?: Array<'youtube' | 'vimeo'>;
}

// Rich Content
export interface HtmlField extends BaseSettingField {
  type: 'html';
  placeholder?: string;
}

export interface InlineRichTextField extends BaseSettingField {
  type: 'inline_richtext';
  toolbar?: Array<'bold' | 'italic' | 'link'>;
}

export interface RichTextField extends BaseSettingField {
  type: 'richtext';
  toolbar?: Array<'bold' | 'italic' | 'link' | 'image' | 'list' | 'header'>;
}

// Advanced
export interface FontPickerField extends BaseSettingField {
  type: 'font_picker';
  default?: string;
}

export interface LinkListField extends BaseSettingField {
  type: 'link_list';
  maxLinks?: number;
}

export interface LiquidField extends BaseSettingField {
  type: 'liquid';
  placeholder?: string;
}

export interface MetaobjectField extends BaseSettingField {
  type: 'metaobject';
  type_name: string;
}

export interface MetaobjectListField extends BaseSettingField {
  type: 'metaobject_list';
  type_name: string;
  max?: number;
}

// Layout
export interface TextAlignmentField extends BaseSettingField {
  type: 'text_alignment';
  options?: Array<'left' | 'center' | 'right' | 'justify'>;
}

// URL
export interface UrlField extends BaseSettingField {
  type: 'url';
  placeholder?: string;
  suggestInternal?: boolean;
}

export type SettingField =
  | CheckboxField
  | NumberField
  | RadioField
  | RangeField
  | SelectField
  | TextField
  | TextAreaField
  | ArticleField
  | BlogField
  | CollectionField
  | CollectionListField
  | PageField
  | ProductField
  | ProductListField
  | ColorField
  | ColorBackgroundField
  | ColorSchemeField
  | ColorSchemeGroupField
  | ImagePickerField
  | VideoField
  | VideoUrlField
  | HtmlField
  | InlineRichTextField
  | RichTextField
  | FontPickerField
  | LinkListField
  | LiquidField
  | MetaobjectField
  | MetaobjectListField
  | TextAlignmentField
  | UrlField; 