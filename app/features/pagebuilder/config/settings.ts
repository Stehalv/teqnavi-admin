import type { SettingField } from '../types/settings.js';

export const SECTION_SETTINGS: Record<string, SettingField[]> = {
  page: [
    {
      key: 'layout',
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Full Width', value: 'full-width' },
        { label: 'Contained', value: 'contained' }
      ]
    },
    {
      key: 'spacing',
      type: 'range',
      label: 'Section Spacing',
      min: 0,
      max: 100,
      step: 4
    },
    {
      key: 'seo_title',
      type: 'text',
      label: 'SEO Title',
      helpText: 'The title that appears in search engine results'
    },
    {
      key: 'seo_description',
      type: 'textarea',
      label: 'SEO Description',
      helpText: 'The description that appears in search engine results',
      maxLength: 160
    },
    {
      key: 'url_handle',
      type: 'url',
      label: 'URL Handle',
      suggestInternal: true
    }
  ],
  hero: [
    {
      key: 'heading',
      type: 'text',
      label: 'Heading'
    },
    {
      key: 'subheading',
      type: 'textarea',
      label: 'Subheading'
    },
    {
      key: 'background_type',
      type: 'select',
      label: 'Background Type',
      options: [
        { label: 'Color', value: 'color' },
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' }
      ]
    },
    {
      key: 'background_color',
      type: 'color_background',
      label: 'Background Color',
      allowAlpha: true,
      allowGradient: true
    },
    {
      key: 'background_image',
      type: 'image_picker',
      label: 'Background Image',
      aspectRatio: 16/9
    },
    {
      key: 'background_video',
      type: 'video_url',
      label: 'Background Video',
      accept: ['youtube', 'vimeo']
    },
    {
      key: 'text_color',
      type: 'color',
      label: 'Text Color'
    },
    {
      key: 'content_width',
      type: 'select',
      label: 'Content Width',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Full', value: 'full' }
      ]
    },
    {
      key: 'overlay_opacity',
      type: 'range',
      label: 'Overlay Opacity',
      min: 0,
      max: 1,
      step: 0.1
    }
  ],
  'featured-collection': [
    {
      key: 'title',
      type: 'text',
      label: 'Title'
    },
    {
      key: 'collection',
      type: 'collection',
      label: 'Collection'
    },
    {
      key: 'products_to_show',
      type: 'range',
      label: 'Products to Show',
      min: 2,
      max: 12,
      step: 1
    },
    {
      key: 'columns_desktop',
      type: 'select',
      label: 'Desktop Columns',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
        { label: '5 Columns', value: '5' }
      ]
    },
    {
      key: 'columns_mobile',
      type: 'select',
      label: 'Mobile Columns',
      options: [
        { label: '1 Column', value: '1' },
        { label: '2 Columns', value: '2' }
      ]
    },
    {
      key: 'show_view_all',
      type: 'checkbox',
      label: 'Show View All Button'
    }
  ]
};

export const BLOCK_SETTINGS: Record<string, SettingField[]> = {
  text: [
    {
      key: 'text',
      type: 'richtext',
      label: 'Text Content'
    },
    {
      key: 'size',
      type: 'select',
      label: 'Text Size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' }
      ]
    },
    {
      key: 'alignment',
      type: 'text_alignment',
      label: 'Alignment'
    },
    {
      key: 'color',
      type: 'color',
      label: 'Text Color'
    }
  ],
  image: [
    {
      key: 'image',
      type: 'image_picker',
      label: 'Image'
    },
    {
      key: 'alt',
      type: 'text',
      label: 'Alt Text'
    },
    {
      key: 'aspect_ratio',
      type: 'select',
      label: 'Aspect Ratio',
      options: [
        { label: 'Square (1:1)', value: '1/1' },
        { label: '4:3', value: '4/3' },
        { label: '16:9', value: '16/9' },
        { label: 'Original', value: 'original' }
      ]
    },
    {
      key: 'overlay_opacity',
      type: 'range',
      label: 'Overlay Opacity',
      min: 0,
      max: 1,
      step: 0.1
    }
  ],
  button: [
    {
      key: 'text',
      type: 'text',
      label: 'Button Text'
    },
    {
      key: 'link',
      type: 'url',
      label: 'Button Link'
    },
    {
      key: 'style',
      type: 'select',
      label: 'Style',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Plain', value: 'plain' }
      ]
    },
    {
      key: 'size',
      type: 'select',
      label: 'Size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' }
      ]
    },
    {
      key: 'full_width',
      type: 'checkbox',
      label: 'Full Width'
    },
    {
      key: 'open_in_new_tab',
      type: 'checkbox',
      label: 'Open in New Tab'
    }
  ],
  product: [
    {
      key: 'product',
      type: 'product',
      label: 'Product'
    },
    {
      key: 'show_price',
      type: 'checkbox',
      label: 'Show Price'
    },
    {
      key: 'show_vendor',
      type: 'checkbox',
      label: 'Show Vendor'
    },
    {
      key: 'show_rating',
      type: 'checkbox',
      label: 'Show Rating'
    },
    {
      key: 'show_badges',
      type: 'checkbox',
      label: 'Show Badges'
    },
    {
      key: 'enable_quick_add',
      type: 'checkbox',
      label: 'Enable Quick Add'
    },
    {
      key: 'image_aspect_ratio',
      type: 'select',
      label: 'Image Aspect Ratio',
      options: [
        { label: 'Square (1:1)', value: '1/1' },
        { label: '4:3', value: '4/3' },
        { label: '16:9', value: '16/9' }
      ]
    }
  ]
}; 