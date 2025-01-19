import React, { useState, useCallback } from "react";
import { Frame, Loading, Banner, Toast, Page } from "@shopify/polaris";
import { PageBuilder } from "~/features/pagebuilder/components/PageBuilder/PageBuilder.js";
import { PageBuilderProvider } from "~/features/pagebuilder/context/PageBuilderContext.js";
import type { Page as PageType } from "~/features/pagebuilder/types.js";

interface SaveError {
  message: string;
  details?: string;
}

export default function PageBuilderIndex() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<SaveError | null>(null);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const handleSave = useCallback(async (page: PageType) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowSaveToast(true);
    } catch (error) {
      setSaveError({
        message: 'Failed to save page',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsSaving(false);
    }
  }, []);

  const initialPage: PageType = {
    id: '1',
    shopId: '12345',
    title: 'Example Page',
    handle: 'example-page',
    template: 'page',
    isPublished: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: {
      hero1: {
        id: 'hero1',
        type: 'hero',
        settings: {
          heading: 'Welcome to our store',
          subheading: 'Shop the latest trends',
          button_text: 'Shop Now',
          button_link: '/collections/all',
          background_type: 'color',
          background_value: '#000000',
          text_color: '#ffffff',
          text_alignment: 'center',
          content_width: 'medium',
          min_height: 500,
          overlay_opacity: 0.5
        },
        blocks: {},
        block_order: []
      },
      collection1: {
        id: 'collection1',
        type: 'featured-collection',
        settings: {
          title: 'Featured Products',
          collection_id: '1234',
          products_to_show: 4,
          columns_desktop: 4,
          columns_mobile: 2,
          show_view_all: true,
          view_all_style: 'button',
          enable_quick_add: true,
          show_vendor: true,
          show_rating: true,
          show_secondary_image: false,
          enable_filtering: false,
          enable_sorting: false
        },
        blocks: {},
        block_order: []
      },
      richtext1: {
        id: 'richtext1',
        type: 'rich-text',
        settings: {
          content: 'Our Story\n\nWelcome to our store! We offer the best products at great prices.',
          text_alignment: 'left',
          narrow_content: true,
          enable_custom_text_color: true,
          text_color: '#202223',
          background_type: 'none'
        },
        blocks: {},
        block_order: []
      }
    },
    section_order: ['hero1', 'collection1', 'richtext1'],
    settings: {
      layout: 'full-width',
      spacing: 16,
      background: {
        type: 'color',
        value: '#ffffff'
      },
      seo: {
        title: 'Welcome to our store',
        description: 'Shop the latest trends and products',
        url_handle: 'example-page'
      }
    }
  };

  return (
    <Frame>
      {isSaving && <Loading />}
      
      {saveError && (
        <Banner
          title="Error"
          tone="critical"
          onDismiss={() => setSaveError(null)}
        >
          <p>{saveError.message}</p>
          {saveError.details && <p>{saveError.details}</p>}
        </Banner>
      )}

      <PageBuilderProvider initialPage={initialPage} onSave={handleSave}>
        <PageBuilder />
      </PageBuilderProvider>

      {showSaveToast && (
        <Toast
          content="Page saved successfully"
          onDismiss={() => setShowSaveToast(false)}
        />
      )}
    </Frame>
  );
} 