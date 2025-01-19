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

// Block Types with Discriminated Unions
interface BaseBlock {
  id: string;
  label?: string;
  custom_class?: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  settings: {
    text: string;
    alignment: 'left' | 'center' | 'right';
    size: 'small' | 'medium' | 'large';
    color?: string;
    font_family?: string;
    font_weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  };
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  settings: {
    image: string;
    alt: string;
    overlay_opacity: number;
    link?: string;
    aspect_ratio?: '1/1' | '4/3' | '16/9' | 'original';
    focal_point?: { x: number; y: number };
    lazy_load: boolean;
  };
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  settings: {
    text: string;
    link: string;
    style: 'primary' | 'secondary' | 'plain';
    size: 'small' | 'medium' | 'large';
    full_width: boolean;
    open_in_new_tab: boolean;
    icon?: string;
    icon_position?: 'left' | 'right';
  };
}

export interface ProductBlock extends BaseBlock {
  type: 'product';
  settings: {
    product_id: string;
    show_price: boolean;
    show_vendor: boolean;
    show_rating: boolean;
    show_badges: boolean;
    enable_quick_add: boolean;
    image_aspect_ratio: '1/1' | '4/3' | '16/9';
  };
}

export type Block = TextBlock | ImageBlock | ButtonBlock | ProductBlock;

// Section Types with Discriminated Unions
interface BaseSection {
  id: string;
  type: string;
  blocks: Record<string, Block>;
  block_order: string[];
  custom_class?: string;
  padding_top?: number;
  padding_bottom?: number;
}

export interface HeroSection extends BaseSection {
  type: 'hero';
  settings: {
    heading: string;
    subheading?: string;
    button_text?: string;
    button_link?: string;
    background_type: 'color' | 'image' | 'video';
    background_value: string;
    text_color: string;
    text_alignment: 'left' | 'center' | 'right';
    content_width: 'small' | 'medium' | 'large' | 'full';
    min_height: number;
    overlay_opacity: number;
  };
}

export interface FeaturedCollectionSection extends BaseSection {
  type: 'featured-collection';
  settings: {
    title: string;
    collection_id: string;
    products_to_show: number;
    columns_desktop: 2 | 3 | 4 | 5;
    columns_mobile: 1 | 2;
    show_view_all: boolean;
    view_all_style: 'link' | 'button';
    enable_quick_add: boolean;
    show_secondary_image: boolean;
    show_vendor: boolean;
    show_rating: boolean;
    enable_filtering: boolean;
    enable_sorting: boolean;
  };
}

export interface RichTextSection extends BaseSection {
  type: 'rich-text';
  settings: {
    content: string;
    text_alignment: 'left' | 'center' | 'right';
    narrow_content: boolean;
    enable_custom_text_color: boolean;
    text_color?: string;
    background_type: 'none' | 'color';
    background_color?: string;
  };
}

export interface ImageWithTextSection extends BaseSection {
  type: 'image-with-text';
  settings: {
    image: string;
    image_width: 'small' | 'medium' | 'large';
    image_aspect_ratio: '1/1' | '4/3' | '16/9';
    heading: string;
    text: string;
    button_label?: string;
    button_link?: string;
    layout: 'image_first' | 'text_first';
    desktop_content_position: 'top' | 'middle' | 'bottom';
    desktop_content_alignment: 'left' | 'center' | 'right';
    enable_custom_text_color: boolean;
    text_color?: string;
  };
}

export interface NewsletterSection extends BaseSection {
  type: 'newsletter';
  settings: {
    heading: string;
    subheading?: string;
    background_type: 'none' | 'color';
    background_color?: string;
    text_color?: string;
    content_alignment: 'left' | 'center' | 'right';
    narrow_content: boolean;
    show_social_sharing: boolean;
    enable_name_field: boolean;
    success_message: string;
  };
}

export type Section = 
  | HeroSection 
  | FeaturedCollectionSection 
  | RichTextSection 
  | ImageWithTextSection 
  | NewsletterSection;

export type SectionType = Section['type'];
export type BlockType = Block['type'];

// Page Type
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
  version?: number;
  publishedAt?: Date;
  deletedAt?: Date;
}

// State Types
export interface DragItem {
  id: string;
  type: 'SECTION' | 'BLOCK';
  index: number;
  parentId?: string;
}

export interface DropResult {
  id: string;
  type: 'SECTION' | 'BLOCK';
  index: number;
  parentId?: string;
} 