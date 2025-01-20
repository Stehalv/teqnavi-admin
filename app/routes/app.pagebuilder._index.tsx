import React, { useState, useCallback } from "react";
import { Frame, Loading, Banner, Toast, Page } from "@shopify/polaris";
import { PageBuilder } from "~/features/pagebuilder/components/PageBuilder/PageBuilder.js";
import { PageBuilderProvider } from "~/features/pagebuilder/context/PageBuilderContext.js";
import type { PageUI } from "~/features/pagebuilder/types/shopify.js";
import type { SectionRegistry } from "~/features/pagebuilder/types/templates.js";
import type { TextField, CollectionField, RichTextField } from "~/features/pagebuilder/types/settings.js";

interface SaveError {
  message: string;
  details?: string;
}

export default function PageBuilderIndex() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<SaveError | null>(null);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const handleSave = useCallback(async (page: PageUI) => {
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

  const initialPage: PageUI = {
    id: '1',
    shopId: '12345',
    title: 'Example Page',
    handle: 'example-page',
    isPublished: false,
    data: {
      sections: {
        'hero-section': {
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
        'featured-collection': {
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
        'rich-text': {
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
      order: ['hero-section', 'featured-collection', 'rich-text']
    },
    settings: {
      seo: {
        title: 'Example Page',
        description: 'Welcome to our store',
        url_handle: 'example-page'
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const sectionRegistry: SectionRegistry = {
    hero: {
      type: 'hero',
      name: 'Hero Banner',
      schema: {
        settings: [
          {
            type: 'text',
            key: 'heading',
            label: 'Heading',
            defaultValue: 'Welcome'
          } as TextField,
          {
            type: 'text',
            key: 'subheading',
            label: 'Subheading',
            defaultValue: 'Shop the latest trends'
          } as TextField
        ]
      },
      liquid: `
        <div class="hero-banner" style="background-color: {{ section.settings.background_value }}">
          <div class="hero-content">
            <h1>{{ section.settings.heading }}</h1>
            <p>{{ section.settings.subheading }}</p>
            {% if section.settings.button_text != blank %}
              <a href="{{ section.settings.button_link }}" class="button">
                {{ section.settings.button_text }}
              </a>
            {% endif %}
          </div>
        </div>
      `
    },
    'featured-collection': {
      type: 'featured-collection',
      name: 'Featured Collection',
      schema: {
        settings: [
          {
            type: 'text',
            key: 'title',
            label: 'Title',
            defaultValue: 'Featured Products'
          } as TextField,
          {
            type: 'collection',
            key: 'collection_id',
            label: 'Collection'
          } as CollectionField
        ]
      },
      liquid: `
        <div class="featured-collection">
          <h2>{{ section.settings.title }}</h2>
          {% assign collection = collections[section.settings.collection_id] %}
          {% if collection != blank %}
            <div class="product-grid">
              {% for product in collection.products limit: section.settings.products_to_show %}
                <div class="product-card">
                  <img src="{{ product.featured_image | img_url: 'medium' }}" alt="{{ product.title }}">
                  <h3>{{ product.title }}</h3>
                  <p>{{ product.price | money }}</p>
                </div>
              {% endfor %}
            </div>
          {% endif %}
        </div>
      `
    },
    'rich-text': {
      type: 'rich-text',
      name: 'Rich Text',
      schema: {
        settings: [
          {
            type: 'richtext',
            key: 'content',
            label: 'Content',
            defaultValue: 'Welcome to our store'
          } as RichTextField
        ]
      },
      liquid: `
        <div class="rich-text">
          <div class="rich-text__content">
            {{ section.settings.content }}
          </div>
        </div>
      `
    }
  };

  return (
    <Frame>
      {isSaving && <Loading />}
      
      {saveError && (
        <Banner
          title={saveError.message}
          tone="critical"
          onDismiss={() => setSaveError(null)}
        >
          {saveError.details && <p>{saveError.details}</p>}
        </Banner>
      )}

      {showSaveToast && (
        <Toast
          content="Page saved successfully"
          onDismiss={() => setShowSaveToast(false)}
        />
      )}

      <Page fullWidth>
        <PageBuilderProvider
          initialPage={initialPage}
          sectionRegistry={sectionRegistry}
          onSave={handleSave}
        >
          <PageBuilder />
        </PageBuilderProvider>
      </Page>
    </Frame>
  );
} 