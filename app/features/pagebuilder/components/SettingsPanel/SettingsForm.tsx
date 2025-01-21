import React, { memo, useCallback, useMemo } from 'react';
import { FormLayout, Banner, Text, BlockStack } from '@shopify/polaris';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import type { Section } from '../../types/shopify.js';
import type {
  SettingField,
  BaseSettingField,
  CheckboxField,
  NumberField,
  RadioField,
  RangeField,
  SelectField,
  TextField,
  TextAreaField,
  FontPickerField,
  LinkListField,
  LiquidField,
  MetaobjectField,
  MetaobjectListField,
  ColorField,
  ColorBackgroundField,
  ColorSchemeField,
  ColorSchemeGroupField,
  TextAlignmentField,
  UrlField,
  ImagePickerField,
  VideoField,
  VideoUrlField,
  ArticleField,
  BlogField,
  CollectionField,
  CollectionListField,
  PageField,
  ProductField,
  ProductListField,
  HtmlField,
  InlineRichTextField,
  RichTextField
} from '../../types/settings.js';

// Import all input components
import {
  CheckboxInput,
  NumberInput,
  RadioInput,
  RangeInput,
  SelectInput,
  TextInput,
  TextAreaInput
} from "../SettingsPanel/components/inputs/BasicInputs.js";
import {
  FontPickerInput,
  LinkListInput,
  LiquidInput,
  MetaobjectInput,
  MetaobjectListInput
} from "../SettingsPanel/components/inputs/AdvancedInputs.js";
import {
  ColorInput,
  ColorBackgroundInput,
  ColorSchemeInput,
  ColorSchemeGroupInput
} from "../SettingsPanel/components/inputs/ColorInputs.js";
import {
  TextAlignmentInput,
  UrlInput
} from "../SettingsPanel/components/inputs/LayoutInputs.js";
import {
  ImagePickerInput,
  VideoInput,
  VideoUrlInput
} from "../SettingsPanel/components/inputs/MediaInputs.js";
import {
  ArticlePicker,
  BlogPicker,
  CollectionPicker,
  CollectionListPicker,
  PagePicker,
  ProductPicker,
  ProductListPicker
} from "../SettingsPanel/components/inputs/ResourcePickers.js";
import {
  HtmlInput,
  InlineRichTextInput,
  RichTextInput
} from "../SettingsPanel/components/inputs/RichContentInputs.js";

interface SettingsFormProps {
  sectionKey: string;
  section: {
    type: string;
    settings: Record<string, any>;
  };
  schema: SettingField[];
}

const SettingFieldRenderer = memo(function SettingFieldRenderer({
  field,
  value,
  onChange
}: {
  field: SettingField;
  value: any;
  onChange: (value: any) => void;
}) {
  if (!field || !field.type) {
    return <Text as="p">Invalid field configuration</Text>;
  }

  const fieldType = (field as BaseSettingField & { type: string }).type;

  switch (fieldType) {
    // Basic inputs
    case "checkbox":
      return <CheckboxInput field={field as CheckboxField} value={value} onChange={onChange} />;
    case "number":
      return <NumberInput field={field as NumberField} value={value} onChange={onChange} />;
    case "radio":
      return <RadioInput field={field as RadioField} value={value} onChange={onChange} />;
    case "range":
      return <RangeInput field={field as RangeField} value={value} onChange={onChange} />;
    case "select":
      return <SelectInput field={field as SelectField} value={value} onChange={onChange} />;
    case "text":
      return <TextInput field={field as TextField} value={value} onChange={onChange} />;
    case "textarea":
      return <TextAreaInput field={field as TextAreaField} value={value} onChange={onChange} />;

    // Advanced inputs
    case "font_picker":
      return <FontPickerInput field={field as FontPickerField} value={value} onChange={onChange} />;
    case "link_list":
      return <LinkListInput field={field as LinkListField} value={value} onChange={onChange} />;
    case "liquid":
      return <LiquidInput field={field as LiquidField} value={value} onChange={onChange} />;
    case "metaobject":
      return <MetaobjectInput field={field as MetaobjectField} value={value} onChange={onChange} />;
    case "metaobject_list":
      return <MetaobjectListInput field={field as MetaobjectListField} value={value} onChange={onChange} />;

    // Color inputs
    case "color":
      return <ColorInput field={field as ColorField} value={value} onChange={onChange} />;
    case "color_background":
      return <ColorBackgroundInput field={field as ColorBackgroundField} value={value} onChange={onChange} />;
    case "color_scheme":
      return <ColorSchemeInput field={field as ColorSchemeField} value={value} onChange={onChange} />;
    case "color_scheme_group":
      return <ColorSchemeGroupInput field={field as ColorSchemeGroupField} value={value} onChange={onChange} />;

    // Layout inputs
    case "text_alignment":
      return <TextAlignmentInput field={field as TextAlignmentField} value={value} onChange={onChange} />;
    case "url":
      return <UrlInput field={field as UrlField} value={value} onChange={onChange} />;

    // Media inputs
    case "image_picker":
      return <ImagePickerInput field={field as ImagePickerField} value={value} onChange={onChange} />;
    case "video":
      return <VideoInput field={field as VideoField} value={value} onChange={onChange} />;
    case "video_url":
      return <VideoUrlInput field={field as VideoUrlField} value={value} onChange={onChange} />;

    // Resource pickers
    case "article":
      return <ArticlePicker field={field as ArticleField} value={value} onChange={onChange} />;
    case "blog":
      return <BlogPicker field={field as BlogField} value={value} onChange={onChange} />;
    case "collection":
      return <CollectionPicker field={field as CollectionField} value={value} onChange={onChange} />;
    case "collection_list":
      return <CollectionListPicker field={field as CollectionListField} value={value} onChange={onChange} />;
    case "page":
      return <PagePicker field={field as PageField} value={value} onChange={onChange} />;
    case "product":
      return <ProductPicker field={field as ProductField} value={value} onChange={onChange} />;
    case "product_list":
      return <ProductListPicker field={field as ProductListField} value={value} onChange={onChange} />;

    // Rich content inputs
    case "html":
      return <HtmlInput field={field as HtmlField} value={value} onChange={onChange} />;
    case "inline_richtext":
      return <InlineRichTextInput field={field as InlineRichTextField} value={value} onChange={onChange} />;
    case "richtext":
      return <RichTextInput field={field as RichTextField} value={value} onChange={onChange} />;

    default:
      return (
        <Banner tone="warning">
          Unknown field type: {fieldType}
        </Banner>
      );
  }
});

export function SettingsForm({ sectionKey, section, schema }: SettingsFormProps) {
  const { updateSectionSettings } = usePageBuilder();

  const handleSettingChange = useCallback((id: string, value: any) => {
    try {
      // Find the field schema to validate the value
      const fieldSchema = schema.find(field => field.id === id);
      if (!fieldSchema) {
        console.warn(`No schema found for field: ${id}`);
        return;
      }

      // Validate value based on field type
      let validatedValue = value;
      switch (fieldSchema.type) {
        case 'number':
        case 'range':
          validatedValue = Number(value);
          if (isNaN(validatedValue)) {
            console.error(`Invalid number value for field: ${id}`);
            return;
          }
          if (fieldSchema.min !== undefined && validatedValue < fieldSchema.min) {
            validatedValue = fieldSchema.min;
          }
          if (fieldSchema.max !== undefined && validatedValue > fieldSchema.max) {
            validatedValue = fieldSchema.max;
          }
          break;
        case 'checkbox':
          validatedValue = Boolean(value);
          break;
        case 'select':
          if (fieldSchema.options && !fieldSchema.options.find(opt => opt.value === value)) {
            console.error(`Invalid select value for field: ${id}`);
            return;
          }
          break;
      }

      // Only update if value has changed
      if (section.settings[id] !== validatedValue) {
        console.log('Updating setting:', { id, value: validatedValue, currentSettings: section.settings });
        updateSectionSettings(sectionKey, { [id]: validatedValue });
      }
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  }, [sectionKey, section.settings, schema, updateSectionSettings]);

  // Memoize the field renderers to prevent unnecessary re-renders
  const fieldRenderers = useMemo(() => {
    if (!schema || schema.length === 0) {
      return null;
    }

    return schema.map((field: SettingField) => {
      // Use the current value if it exists, otherwise use the default value from schema
      const currentValue = section.settings[field.id] !== undefined 
        ? section.settings[field.id] 
        : field.default;

      return (
        <FormLayout.Group key={`field-${field.id}`}>
          <SettingFieldRenderer
            field={field}
            value={currentValue}
            onChange={(value) => handleSettingChange(field.id, value)}
          />
        </FormLayout.Group>
      );
    });
  }, [schema, section.settings, handleSettingChange]);

  if (!fieldRenderers) {
    return (
      <BlockStack gap="400">
        <Text as="p">No schema fields defined for this section</Text>
      </BlockStack>
    );
  }

  return (
    <FormLayout>
      {fieldRenderers}
    </FormLayout>
  );
} 