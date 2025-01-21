import React, { memo } from 'react';
import { FormLayout } from '@shopify/polaris';
import { TextInput } from './components/inputs/BasicInputs.js';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import type { PageUI } from '../../types/shopify.js';
import type { TextField } from '../../types/settings.js';

const PAGE_SETTINGS_SCHEMA: TextField[] = [
  {
    id: 'title',
    type: 'text',
    label: 'Title',
  },
  {
    id: 'handle',
    type: 'text',
    label: 'URL Handle',
  },
  {
    id: 'seo_title',
    type: 'text',
    label: 'SEO Title',
  },
  {
    id: 'seo_description',
    type: 'text',
    label: 'SEO Description',
  }
];

export const PageSettingsForm = memo(function PageSettingsForm() {
  const { page, updatePageSettings, updatePage } = usePageBuilder();

  const handleSettingChange = (id: string, value: string) => {
    if (id === 'handle') {
      // Update both the page handle and settings handle
      updatePage({ ...page, handle: value });
      updatePageSettings({
        ...page.settings,
        handle: value
      });
    } else if (id.startsWith('seo_')) {
      // Handle SEO settings nested structure
      const seoField = id.replace('seo_', '');
      updatePageSettings({
        ...page.settings,
        seo: {
          ...page.settings?.seo,
          [seoField]: value
        }
      });
    } else {
      // Handle other settings
      updatePageSettings({
        ...page.settings,
        [id]: value
      });
    }
  };

  return (
    <FormLayout>
      {PAGE_SETTINGS_SCHEMA.map((field) => {
        let value;
        if (field.id === 'handle') {
          // Use page.handle directly
          value = page.handle;
        } else if (field.id.startsWith('seo_')) {
          value = page.settings?.seo?.[field.id.replace('seo_', '')];
        } else {
          value = page.settings?.[field.id];
        }

        return (
          <TextInput
            key={field.id}
            field={field}
            value={value}
            onChange={(value) => handleSettingChange(field.id, value)}
          />
        );
      })}
    </FormLayout>
  );
}); 