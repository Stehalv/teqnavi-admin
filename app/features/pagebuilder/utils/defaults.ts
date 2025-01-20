import type { Section, SectionType } from '../types.js';

export function getDefaultSectionSettings(type: SectionType): Section['settings'] {
  switch (type) {
    case 'hero':
      return {
        heading: 'Welcome to our store',
        subheading: 'Shop the latest trends',
        background_type: 'color',
        background_value: '#000000',
        text_color: '#ffffff',
        text_alignment: 'center',
        content_width: 'medium',
        min_height: 400,
        overlay_opacity: 0
      };
    case 'featured-collection':
      return {
        title: 'Featured Collection',
        collection_id: '',
        products_to_show: 4,
        columns_desktop: 4,
        columns_mobile: 2,
        show_view_all: true,
        view_all_style: 'button',
        enable_quick_add: true,
        show_secondary_image: true,
        show_vendor: true,
        show_rating: true,
        enable_filtering: false,
        enable_sorting: false
      };
    case 'rich-text':
      return {
        content: 'Add your content here',
        text_alignment: 'left',
        narrow_content: true,
        enable_custom_text_color: false,
        background_type: 'none'
      };
    case 'image-with-text':
      return {
        image: '',
        image_width: 'medium',
        image_aspect_ratio: '16/9',
        heading: 'Image with text',
        text: 'Pair text with an image',
        layout: 'image_first',
        desktop_content_position: 'middle',
        desktop_content_alignment: 'left',
        enable_custom_text_color: false
      };
    case 'newsletter':
      return {
        heading: 'Subscribe to our newsletter',
        background_type: 'none',
        content_alignment: 'center',
        narrow_content: true,
        show_social_sharing: true,
        enable_name_field: true,
        success_message: 'Thanks for subscribing!'
      };
    default:
      return {};
  }
} 