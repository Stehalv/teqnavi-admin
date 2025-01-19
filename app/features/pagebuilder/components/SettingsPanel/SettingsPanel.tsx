import React, { memo, useCallback } from "react";
import { Card, BlockStack, FormLayout, TextField, Select, Button, Box, Text, ColorPicker, RangeSlider, Checkbox, Banner, InlineStack } from "@shopify/polaris";
import { usePageBuilder } from "../../context/PageBuilderContext.js";
import type { Section, Block } from "../../types.js";
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
    updatePageSettings,
    updateSectionSettings,
    updateBlockSettings,
    deleteSection,
    deleteBlock
  } = usePageBuilder();

  const selectedSection = selectedSectionId ? page.sections[selectedSectionId] : null;
  const selectedBlock = selectedSection && selectedBlockId ? selectedSection.blocks[selectedBlockId] : null;

  const handlePageSettingChange = useCallback((key: string, value: any) => {
    updatePageSettings({ [key]: value });
  }, [updatePageSettings]);

  const handleSectionSettingChange = useCallback((key: string, value: any) => {
    if (!selectedSectionId) return;
    updateSectionSettings(selectedSectionId, { [key]: value });
  }, [selectedSectionId, updateSectionSettings]);

  const handleBlockSettingChange = useCallback((key: string, value: any) => {
    if (!selectedSectionId || !selectedBlockId) return;
    updateBlockSettings(selectedSectionId, selectedBlockId, { [key]: value });
  }, [selectedSectionId, selectedBlockId, updateBlockSettings]);

  const handleDelete = useCallback(() => {
    if (selectedBlock && selectedSectionId && selectedBlockId) {
      deleteBlock(selectedSectionId, selectedBlockId);
    } else if (selectedSectionId) {
      deleteSection(selectedSectionId);
    }
  }, [selectedSectionId, selectedBlockId, deleteBlock, deleteSection, selectedBlock]);

  const renderPageSettings = () => (
    <FormLayout>
      <Select
        label="Layout"
        options={[
          { label: 'Full Width', value: 'full-width' },
          { label: 'Contained', value: 'contained' }
        ]}
        value={page.settings.layout}
        onChange={(value) => handlePageSettingChange('layout', value)}
      />
      <RangeSlider
        label="Section Spacing"
        value={page.settings.spacing}
        min={0}
        max={100}
        step={4}
        onChange={(value) => handlePageSettingChange('spacing', value)}
      />
      <TextField
        label="SEO Title"
        value={page.settings.seo.title}
        onChange={(value) => handlePageSettingChange('seo.title', value)}
        autoComplete="off"
      />
      <TextField
        label="SEO Description"
        value={page.settings.seo.description}
        multiline={4}
        onChange={(value) => handlePageSettingChange('seo.description', value)}
        autoComplete="off"
      />
      <TextField
        label="URL Handle"
        value={page.settings.seo.url_handle}
        onChange={(value) => handlePageSettingChange('seo.url_handle', value)}
        autoComplete="off"
      />
    </FormLayout>
  );

  const renderHeroSettings = (section: Section) => {
    if (section.type !== 'hero') return null;
    const { settings } = section;

    const defaultColor: Color = {
      hue: 180,
      brightness: 1,
      saturation: 1
    };

    const defaultTextColor: Color = {
      hue: 0,
      brightness: 0,
      saturation: 0
    };

    return (
      <FormLayout>
        <TextField
          label="Heading"
          value={settings.heading || ''}
          onChange={(value) => handleSectionSettingChange('heading', value)}
          autoComplete="off"
        />
        <TextField
          label="Subheading"
          value={settings.subheading || ''}
          multiline={2}
          onChange={(value) => handleSectionSettingChange('subheading', value)}
          autoComplete="off"
        />
        <Select
          label="Background Type"
          options={[
            { label: 'Color', value: 'color' },
            { label: 'Image', value: 'image' }
          ]}
          value={settings.background_type}
          onChange={(value) => handleSectionSettingChange('background_type', value)}
        />
        {settings.background_type === 'color' ? (
          <div>
            <label>Background Color</label>
            <ColorPicker
              color={typeof settings.background_value === 'object' ? settings.background_value as Color : defaultColor}
              onChange={(color) => handleSectionSettingChange('background_value', color)}
              allowAlpha
            />
          </div>
        ) : (
          <ImageUploader
            label="Background Image"
            value={typeof settings.background_value === 'string' ? settings.background_value : ''}
            onChange={(value) => handleSectionSettingChange('background_value', value)}
            aspectRatio={16/9}
          />
        )}
        <div>
          <label>Text Color</label>
          <ColorPicker
            color={typeof settings.text_color === 'object' ? settings.text_color as Color : defaultTextColor}
            onChange={(color) => handleSectionSettingChange('text_color', color)}
          />
        </div>
        <Select
          label="Content Width"
          options={[
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
            { label: 'Full', value: 'full' }
          ]}
          value={settings.content_width}
          onChange={(value) => handleSectionSettingChange('content_width', value)}
        />
        <RangeSlider
          label="Overlay Opacity"
          value={settings.overlay_opacity}
          min={0}
          max={1}
          step={0.1}
          onChange={(value) => handleSectionSettingChange('overlay_opacity', value)}
        />
      </FormLayout>
    );
  };

  const renderFeaturedCollectionSettings = (section: Section) => {
    if (section.type !== 'featured-collection') return null;
    const { settings } = section;

    return (
      <FormLayout>
        <TextField
          label="Title"
          value={settings.title}
          onChange={(value) => handleSectionSettingChange('title', value)}
          autoComplete="off"
        />
        <TextField
          label="Collection ID"
          value={settings.collection_id}
          onChange={(value) => handleSectionSettingChange('collection_id', value)}
          autoComplete="off"
        />
        <RangeSlider
          label="Products to Show"
          value={settings.products_to_show}
          min={2}
          max={12}
          step={1}
          onChange={(value) => handleSectionSettingChange('products_to_show', value)}
        />
        <Select
          label="Desktop Columns"
          options={[
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: '4 Columns', value: '4' },
            { label: '5 Columns', value: '5' }
          ]}
          value={settings.columns_desktop.toString()}
          onChange={(value) => handleSectionSettingChange('columns_desktop', parseInt(value))}
        />
        <Select
          label="Mobile Columns"
          options={[
            { label: '1 Column', value: '1' },
            { label: '2 Columns', value: '2' }
          ]}
          value={settings.columns_mobile.toString()}
          onChange={(value) => handleSectionSettingChange('columns_mobile', parseInt(value))}
        />
        <Button
          onClick={() => handleSectionSettingChange('show_view_all', !settings.show_view_all)}
          pressed={settings.show_view_all}
        >
          Show View All Button
        </Button>
      </FormLayout>
    );
  };

  const renderTextBlockSettings = (block: Block) => {
    if (block.type !== 'text') return null;
    const { settings } = block;

    const defaultTextColor: Color = {
      hue: 0,
      brightness: 0,
      saturation: 0
    };

    return (
      <FormLayout>
        <TextField
          label="Text Content"
          value={settings.text}
          multiline={4}
          onChange={(value) => handleBlockSettingChange('text', value)}
          autoComplete="off"
        />
        <Select
          label="Text Size"
          options={[
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
          ]}
          value={settings.size}
          onChange={(value) => handleBlockSettingChange('size', value)}
        />
        <Select
          label="Alignment"
          options={[
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' }
          ]}
          value={settings.alignment}
          onChange={(value) => handleBlockSettingChange('alignment', value)}
        />
        <div>
          <label>Text Color</label>
          <ColorPicker
            color={typeof settings.color === 'object' ? settings.color as Color : defaultTextColor}
            onChange={(color) => handleBlockSettingChange('color', color)}
          />
        </div>
      </FormLayout>
    );
  };

  const renderImageBlockSettings = (block: Block) => {
    if (block.type !== 'image') return null;
    const { settings } = block;

    return (
      <FormLayout>
        <ImageUploader
          label="Image"
          value={settings.image}
          onChange={(value) => handleBlockSettingChange('image', value)}
          aspectRatio={Number(settings.aspect_ratio?.split('/')[0]) / Number(settings.aspect_ratio?.split('/')[1])}
        />
        <TextField
          label="Alt Text"
          value={settings.alt}
          onChange={(value) => handleBlockSettingChange('alt', value)}
          autoComplete="off"
        />
        <Select
          label="Aspect Ratio"
          options={[
            { label: 'Square (1:1)', value: '1/1' },
            { label: '4:3', value: '4/3' },
            { label: '16:9', value: '16/9' },
            { label: 'Original', value: 'original' }
          ]}
          value={settings.aspect_ratio}
          onChange={(value) => handleBlockSettingChange('aspect_ratio', value)}
        />
        <RangeSlider
          label="Overlay Opacity"
          value={settings.overlay_opacity}
          min={0}
          max={1}
          step={0.1}
          onChange={(value) => handleBlockSettingChange('overlay_opacity', value)}
        />
      </FormLayout>
    );
  };

  const renderButtonBlockSettings = (block: Block) => {
    if (block.type !== 'button') return null;
    const { settings } = block;

    return (
      <FormLayout>
        <TextField
          label="Button Text"
          value={settings.text}
          onChange={(value) => handleBlockSettingChange('text', value)}
          autoComplete="off"
        />
        <TextField
          label="Button Link"
          value={settings.link}
          onChange={(value) => handleBlockSettingChange('link', value)}
          autoComplete="off"
        />
        <Select
          label="Style"
          options={[
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Plain', value: 'plain' }
          ]}
          value={settings.style}
          onChange={(value) => handleBlockSettingChange('style', value)}
        />
        <Select
          label="Size"
          options={[
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
          ]}
          value={settings.size}
          onChange={(value) => handleBlockSettingChange('size', value)}
        />
        <Button
          onClick={() => handleBlockSettingChange('full_width', !settings.full_width)}
          pressed={settings.full_width}
        >
          Full Width
        </Button>
        <Button
          onClick={() => handleBlockSettingChange('open_in_new_tab', !settings.open_in_new_tab)}
          pressed={settings.open_in_new_tab}
        >
          Open in New Tab
        </Button>
      </FormLayout>
    );
  };

  const renderProductBlockSettings = (block: Block) => {
    if (block.type !== 'product') return null;
    const { settings } = block;

    return (
      <FormLayout>
        <TextField
          label="Product ID"
          value={settings.product_id}
          onChange={(value) => handleBlockSettingChange('product_id', value)}
          autoComplete="off"
        />
        <Button
          onClick={() => handleBlockSettingChange('show_price', !settings.show_price)}
          pressed={settings.show_price}
        >
          Show Price
        </Button>
        <Button
          onClick={() => handleBlockSettingChange('show_vendor', !settings.show_vendor)}
          pressed={settings.show_vendor}
        >
          Show Vendor
        </Button>
        <Button
          onClick={() => handleBlockSettingChange('show_rating', !settings.show_rating)}
          pressed={settings.show_rating}
        >
          Show Rating
        </Button>
        <Button
          onClick={() => handleBlockSettingChange('show_badges', !settings.show_badges)}
          pressed={settings.show_badges}
        >
          Show Badges
        </Button>
        <Button
          onClick={() => handleBlockSettingChange('enable_quick_add', !settings.enable_quick_add)}
          pressed={settings.enable_quick_add}
        >
          Enable Quick Add
        </Button>
        <Select
          label="Image Aspect Ratio"
          options={[
            { label: 'Square (1:1)', value: '1/1' },
            { label: '4:3', value: '4/3' },
            { label: '16:9', value: '16/9' }
          ]}
          value={settings.image_aspect_ratio}
          onChange={(value) => handleBlockSettingChange('image_aspect_ratio', value)}
        />
      </FormLayout>
    );
  };

  const renderSectionSettings = (section: Section) => {
    const settings = SECTION_SETTINGS[section.type as keyof typeof SECTION_SETTINGS];
    if (!settings?.length) return null;

    return (
      <FormLayout>
        {settings.map((field: SettingField) => (
          <SettingFieldRenderer
            key={field.key}
            field={field}
            value={(section.settings as Record<string, unknown>)[field.key]}
            onChange={handleSectionSettingChange}
          />
        ))}
      </FormLayout>
    );
  };

  const renderBlockSettings = (block: Block) => {
    const settings = BLOCK_SETTINGS[block.type as keyof typeof BLOCK_SETTINGS];
    if (!settings?.length) return null;

    return (
      <FormLayout>
        {settings.map((field: SettingField) => (
          <SettingFieldRenderer
            key={field.key}
            field={field}
            value={(block.settings as Record<string, unknown>)[field.key]}
            onChange={handleBlockSettingChange}
          />
        ))}
      </FormLayout>
    );
  };

  if (!selectedSection) {
    return (
      <div className={styles.container}>
        <Card>
          <BlockStack gap="400">
            <Box padding="400">
              <Text variant="headingMd" as="h2">Page Settings</Text>
            </Box>
            <Box padding="400">
              <FormLayout>
                {SECTION_SETTINGS.page?.map((field: SettingField) => (
                  <SettingFieldRenderer
                    key={field.key}
                    field={field}
                    value={(page.settings as Record<string, any>)[field.key]}
                    onChange={handlePageSettingChange}
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
          <Box padding="400" borderBlockEndWidth="025">
            <InlineStack align="space-between">
              <Text variant="headingMd" as="h2">
                {selectedBlock ? 'Block Settings' : 'Section Settings'}
              </Text>
              <Button
                tone="critical"
                variant="plain"
                onClick={handleDelete}
              >
                Delete {selectedBlock ? 'Block' : 'Section'}
              </Button>
            </InlineStack>
          </Box>
          <Box padding="400">
            {selectedBlock ? renderBlockSettings(selectedBlock) : renderSectionSettings(selectedSection)}
          </Box>
        </BlockStack>
      </Card>
    </div>
  );
}); 