import React, { memo, useCallback, useState } from "react";
import { Card, BlockStack, FormLayout, TextField, Select, Button, Box, Text, ColorPicker, RangeSlider, Checkbox, Banner, InlineStack, Modal, ButtonGroup } from "@shopify/polaris";
import { usePageBuilder } from "../../context/PageBuilderContext.js";
import type { SectionUI, BlockUI } from "../../types/shopify.js";
import {
  SECTION_SETTINGS,
  BLOCK_SETTINGS,
} from "../../config/settings.js";
import type {
  SettingField,
  CheckboxField,
  NumberField,
  RadioField,
  RangeField,
  SelectField,
  TextField as TextFieldType,
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
} from "../../types/settings.js";
import { ImageUploader } from "../ImageUploader/ImageUploader.js";
import styles from "./SettingsPanel.module.css";

// Import all input components
import {
  CheckboxInput,
  NumberInput,
  RadioInput,
  RangeInput,
  SelectInput,
  TextInput,
  TextAreaInput
} from "./components/inputs/BasicInputs.js";
import {
  FontPickerInput,
  LinkListInput,
  LiquidInput,
  MetaobjectInput,
  MetaobjectListInput
} from "./components/inputs/AdvancedInputs.js";
import {
  ColorInput,
  ColorBackgroundInput,
  ColorSchemeInput,
  ColorSchemeGroupInput
} from "./components/inputs/ColorInputs.js";
import {
  TextAlignmentInput,
  UrlInput
} from "./components/inputs/LayoutInputs.js";
import {
  ImagePickerInput,
  VideoInput,
  VideoUrlInput
} from "./components/inputs/MediaInputs.js";
import {
  ArticlePicker,
  BlogPicker,
  CollectionPicker,
  CollectionListPicker,
  PagePicker,
  ProductPicker,
  ProductListPicker
} from "./components/inputs/ResourcePickers.js";
import {
  HtmlInput,
  InlineRichTextInput,
  RichTextInput
} from "./components/inputs/RichContentInputs.js";

const EmptyState = memo(function EmptyState() {
  return (
    <div className={styles.container}>
      <Card>
        <Box padding="400">
          <Text variant="bodyMd" as="p">Select a section to edit its settings</Text>
        </Box>
      </Card>
    </div>
  );
});

const SettingFieldRenderer = memo(function SettingFieldRenderer({
  field,
  value,
  onChange
}: {
  field: SettingField;
  value: any;
  onChange: (key: string, value: any) => void;
}) {
  const handleChange = useCallback((newValue: any) => {
    onChange(field.key, newValue);
  }, [field.key, onChange]);

  switch (field.type) {
    // Basic inputs
    case "checkbox":
      return <CheckboxInput field={field as CheckboxField} value={value} onChange={handleChange} />;
    case "number":
      return <NumberInput field={field as NumberField} value={value} onChange={handleChange} />;
    case "radio":
      return <RadioInput field={field as RadioField} value={value} onChange={handleChange} />;
    case "range":
      return <RangeInput field={field as RangeField} value={value} onChange={handleChange} />;
    case "select":
      return <SelectInput field={field as SelectField} value={value} onChange={handleChange} />;
    case "text":
      return <TextInput field={field as TextFieldType} value={value} onChange={handleChange} />;
    case "textarea":
      return <TextAreaInput field={field as TextAreaField} value={value} onChange={handleChange} />;

    // Advanced inputs
    case "font_picker":
      return <FontPickerInput field={field as FontPickerField} value={value} onChange={handleChange} />;
    case "link_list":
      return <LinkListInput field={field as LinkListField} value={value} onChange={handleChange} />;
    case "liquid":
      return <LiquidInput field={field as LiquidField} value={value} onChange={handleChange} />;
    case "metaobject":
      return <MetaobjectInput field={field as MetaobjectField} value={value} onChange={handleChange} />;
    case "metaobject_list":
      return <MetaobjectListInput field={field as MetaobjectListField} value={value} onChange={handleChange} />;

    // Color inputs
    case "color":
      return <ColorInput field={field as ColorField} value={value} onChange={handleChange} />;
    case "color_background":
      return <ColorBackgroundInput field={field as ColorBackgroundField} value={value} onChange={handleChange} />;
    case "color_scheme":
      return <ColorSchemeInput field={field as ColorSchemeField} value={value} onChange={handleChange} />;
    case "color_scheme_group":
      return <ColorSchemeGroupInput field={field as ColorSchemeGroupField} value={value} onChange={handleChange} />;

    // Layout inputs
    case "text_alignment":
      return <TextAlignmentInput field={field as TextAlignmentField} value={value} onChange={handleChange} />;
    case "url":
      return <UrlInput field={field as UrlField} value={value} onChange={handleChange} />;

    // Media inputs
    case "image_picker":
      return <ImagePickerInput field={field as ImagePickerField} value={value} onChange={handleChange} />;
    case "video":
      return <VideoInput field={field as VideoField} value={value} onChange={handleChange} />;
    case "video_url":
      return <VideoUrlInput field={field as VideoUrlField} value={value} onChange={handleChange} />;

    // Resource pickers
    case "article":
      return <ArticlePicker field={field as ArticleField} value={value} onChange={handleChange} />;
    case "blog":
      return <BlogPicker field={field as BlogField} value={value} onChange={handleChange} />;
    case "collection":
      return <CollectionPicker field={field as CollectionField} value={value} onChange={handleChange} />;
    case "collection_list":
      return <CollectionListPicker field={field as CollectionListField} value={value} onChange={handleChange} />;
    case "page":
      return <PagePicker field={field as PageField} value={value} onChange={handleChange} />;
    case "product":
      return <ProductPicker field={field as ProductField} value={value} onChange={handleChange} />;
    case "product_list":
      return <ProductListPicker field={field as ProductListField} value={value} onChange={handleChange} />;

    // Rich content inputs
    case "html":
      return <HtmlInput field={field as HtmlField} value={value} onChange={handleChange} />;
    case "inline_richtext":
      return <InlineRichTextInput field={field as InlineRichTextField} value={value} onChange={handleChange} />;
    case "richtext":
      return <RichTextInput field={field as RichTextField} value={value} onChange={handleChange} />;

    default:
      return (
        <Banner tone="warning">
          Unknown field type: {(field as any).type}
        </Banner>
      );
  }
});

interface Color {
  hue: number;
  brightness: number;
  saturation: number;
  alpha?: number;
}

export const SettingsPanel = memo(function SettingsPanel() {
  const {
    page,
    selectedSectionId,
    selectedBlockId,
    updateSectionSettings,
    updateBlockSettings,
  } = usePageBuilder();

  const selectedSection = selectedSectionId ? page.data.sections[selectedSectionId] : null;
  const selectedBlock = selectedSection && selectedBlockId ? selectedSection.blocks[selectedBlockId] : null;

  const handleSectionSettingChange = useCallback((key: string, value: any) => {
    if (!selectedSectionId) return;
    updateSectionSettings(selectedSectionId, { [key]: value });
  }, [selectedSectionId, updateSectionSettings]);

  const handleBlockSettingChange = useCallback((key: string, value: any) => {
    if (!selectedSectionId || !selectedBlockId) return;
    updateBlockSettings(selectedSectionId, selectedBlockId, { [key]: value });
  }, [selectedSectionId, selectedBlockId, updateBlockSettings]);

  if (!page?.data) {
    return <EmptyState />;
  }

  if (!selectedSection) {
    return (
      <div className={styles.container}>
        <Card>
          <Box padding="400">
            <Text variant="bodyMd" as="p">Select a section to edit its settings</Text>
          </Box>
        </Card>
      </div>
    );
  }

  if (selectedBlock) {
    return (
      <div className={styles.container}>
        <Card>
          <BlockStack gap="400">
            <Box padding="400">
              <BlockStack gap="400">
                <div className={styles.header}>
                  <Text variant="headingMd" as="h2">Block Settings</Text>
                </div>
              </BlockStack>
            </Box>
            <Box padding="400">
              <FormLayout>
                {BLOCK_SETTINGS[selectedBlock.type]?.map((field: SettingField) => (
                  <SettingFieldRenderer
                    key={field.key}
                    field={field}
                    value={selectedBlock.settings[field.key]}
                    onChange={handleBlockSettingChange}
                  />
                ))}
              </FormLayout>
            </Box>
          </BlockStack>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card>
        <BlockStack gap="400">
          <Box padding="400">
            <BlockStack gap="400">
              <div className={styles.header}>
                <Text variant="headingMd" as="h2">Section Settings</Text>
              </div>
            </BlockStack>
          </Box>
          <Box padding="400">
            <FormLayout>
              {SECTION_SETTINGS[selectedSection.type]?.map((field: SettingField) => (
                <SettingFieldRenderer
                  key={field.key}
                  field={field}
                  value={selectedSection.settings[field.key]}
                  onChange={handleSectionSettingChange}
                />
              ))}
            </FormLayout>
          </Box>
        </BlockStack>
      </Card>
    </div>
  );
}); 