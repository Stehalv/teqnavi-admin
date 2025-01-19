import type { SectionType, BlockType } from "../types.js";

export interface BaseSettingField {
  key: string;
  label: string;
  helpText?: string;
  required?: boolean;
  defaultValue?: any;
}

export interface TextField extends BaseSettingField {
  type: "text";
  multiline?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export interface SelectField extends BaseSettingField {
  type: "select";
  options: Array<{ label: string; value: string }>;
}

export interface NumberField extends BaseSettingField {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface ColorField extends BaseSettingField {
  type: "color";
  allowAlpha?: boolean;
}

export interface ImageField extends BaseSettingField {
  type: "image";
  maxSize?: number; // in bytes
  aspectRatio?: number;
  allowedTypes?: string[]; // e.g., ["image/jpeg", "image/png"]
}

export interface ToggleField extends BaseSettingField {
  type: "toggle";
  labelOn?: string;
  labelOff?: string;
}

export type SettingField = 
  | TextField 
  | SelectField 
  | NumberField 
  | ColorField 
  | ImageField 
  | ToggleField;

export const SECTION_SETTINGS: Record<SectionType, SettingField[]> = {
  hero: [
    {
      key: "heading",
      type: "text",
      label: "Heading",
      required: true,
      placeholder: "Enter heading text...",
      defaultValue: "Welcome to our store"
    },
    {
      key: "subheading",
      type: "text",
      label: "Subheading",
      multiline: true,
      placeholder: "Enter subheading text...",
      defaultValue: "Shop the latest trends"
    },
    {
      key: "button_text",
      type: "text",
      label: "Button Text",
      placeholder: "Shop Now",
      defaultValue: "Shop Now"
    },
    {
      key: "button_link",
      type: "text",
      label: "Button Link",
      placeholder: "/collections/all",
      defaultValue: "/collections/all"
    },
    {
      key: "background_color",
      type: "color",
      label: "Background Color",
      allowAlpha: true,
      defaultValue: "#000000"
    },
    {
      key: "text_color",
      type: "color",
      label: "Text Color",
      defaultValue: "#ffffff"
    }
  ],
  "featured-collection": [
    {
      key: "title",
      type: "text",
      label: "Title",
      required: true,
      placeholder: "Featured Products",
      defaultValue: "Featured Products"
    },
    {
      key: "collection",
      type: "select",
      label: "Collection",
      required: true,
      options: [
        { label: "Home page", value: "frontpage" },
        { label: "All products", value: "all" }
      ],
      defaultValue: "frontpage"
    },
    {
      key: "products_to_show",
      type: "number",
      label: "Products to Show",
      min: 2,
      max: 12,
      step: 1,
      defaultValue: 4
    },
    {
      key: "show_view_all",
      type: "toggle",
      label: "Show View All Link",
      defaultValue: true
    }
  ],
  "rich-text": [],
  "image-with-text": [],
  "newsletter": []
};

export const BLOCK_SETTINGS: Record<BlockType, SettingField[]> = {
  text: [
    {
      key: "text",
      type: "text",
      label: "Text Content",
      required: true,
      multiline: true,
      placeholder: "Enter text content...",
      defaultValue: ""
    },
    {
      key: "alignment",
      type: "select",
      label: "Text Alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" }
      ],
      defaultValue: "left"
    },
    {
      key: "size",
      type: "select",
      label: "Text Size",
      options: [
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Large", value: "large" }
      ],
      defaultValue: "medium"
    },
    {
      key: "color",
      type: "color",
      label: "Text Color",
      defaultValue: "#000000"
    }
  ],
  image: [
    {
      key: "image",
      type: "image",
      label: "Image",
      required: true,
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ["image/jpeg", "image/png", "image/webp"]
    },
    {
      key: "alt",
      type: "text",
      label: "Alt Text",
      required: true,
      placeholder: "Describe the image..."
    },
    {
      key: "overlay_opacity",
      type: "number",
      label: "Overlay Opacity",
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0
    }
  ],
  button: [
    {
      key: "text",
      type: "text",
      label: "Button Text",
      required: true,
      placeholder: "Click here",
      defaultValue: "Click here"
    },
    {
      key: "link",
      type: "text",
      label: "Button Link",
      required: true,
      placeholder: "/",
      defaultValue: "/"
    },
    {
      key: "style",
      type: "select",
      label: "Button Style",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" }
      ],
      defaultValue: "primary"
    },
    {
      key: "size",
      type: "select",
      label: "Button Size",
      options: [
        { label: "Small", value: "small" },
        { label: "Large", value: "large" }
      ],
      defaultValue: "small"
    }
  ],
  product: [
    {
      key: "product_id",
      type: "text",
      label: "Product ID",
      required: true
    },
    {
      key: "show_price",
      type: "toggle",
      label: "Show Price",
      defaultValue: true
    },
    {
      key: "show_vendor",
      type: "toggle",
      label: "Show Vendor",
      defaultValue: true
    },
    {
      key: "show_rating",
      type: "toggle",
      label: "Show Rating",
      defaultValue: true
    }
  ]
}; 