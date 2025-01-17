import { TextField, Select, Checkbox, BlockStack, Text, RangeSlider, ColorPicker } from "@shopify/polaris";
import { useState, useMemo } from "react";
import type { Section, ThemeAsset, JsonifyObject } from "../types.js";

interface SchemaField {
  type: string;
  id: string;
  label: string;
  default?: any;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { label: string; value: string }[];
}

interface Schema {
  settings: SchemaField[];
}

export function SectionSettings({ 
  section,
  sectionAsset,
  onChange
}: {
  section: Section;
  sectionAsset: ThemeAsset | JsonifyObject<ThemeAsset>;
  onChange: (section: Section) => void;
}) {
  console.log('SectionSettings received:', {
    sectionId: section.id,
    sectionType: section.type,
    initialSettings: section.settings,
    assetContent: sectionAsset?.content?.substring(0, 100) + '...'
  });

  const [settings, setSettings] = useState(section.settings);

  const schema = useMemo(() => {
    console.log('SectionSettings parsing schema from content:', sectionAsset?.content?.substring(0, 100) + '...');
    if (!sectionAsset?.content) {
      console.log('SectionSettings: No content found');
      return { settings: [] };
    }
    
    const match = sectionAsset.content.match(/{% schema %}([\s\S]*?){% endschema %}/);
    console.log('SectionSettings schema match:', match ? 'Found schema' : 'No schema found');
    if (!match) {
      console.log('SectionSettings: No schema match found');
      return { settings: [] };
    }
    
    try {
      const parsed = JSON.parse(match[1]) as Schema;
      console.log('SectionSettings parsed schema:', parsed);
      return parsed;
    } catch (e) {
      console.error('Failed to parse schema:', e);
      return { settings: [] };
    }
  }, [sectionAsset]);

  const handleSettingChange = (key: string, value: any) => {
    console.log('SectionSettings setting change:', { key, value });
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onChange({
      ...section,
      settings: newSettings
    });
  };

  const renderField = (field: SchemaField) => {
    const value = settings[field.id] ?? field.default;

    switch (field.type) {
      case 'text':
      case 'textarea':
        return (
          <TextField
            label={field.label}
            value={value?.toString() || ""}
            onChange={(value) => handleSettingChange(field.id, value)}
            multiline={field.type === 'textarea'}
            autoComplete="off"
          />
        );

      case 'number':
      case 'range':
        return (
          <RangeSlider
            label={field.label}
            value={parseFloat(value) || 0}
            onChange={(value) => handleSettingChange(field.id, value)}
            min={field.min || 0}
            max={field.max || 100}
            step={field.step || 1}
            output
            suffix={field.unit}
          />
        );

      case 'select':
        return (
          <Select
            label={field.label}
            options={field.options || []}
            value={value || field.default}
            onChange={(value) => handleSettingChange(field.id, value)}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            label={field.label}
            checked={value || false}
            onChange={(checked) => handleSettingChange(field.id, checked)}
          />
        );

      case 'color':
        return (
          <div>
            <Text as="p" variant="bodyMd">{field.label}</Text>
            <ColorPicker
              onChange={(color) => handleSettingChange(field.id, color)}
              color={value || field.default || '#000000'}
            />
          </div>
        );

      case 'header':
        return (
          <Text as="h3" variant="headingMd">{field.label}</Text>
        );

      default:
        return null;
    }
  };

  return (
    <BlockStack gap="400">
      {schema.settings.map((field) => (
        <div key={field.id}>
          {renderField(field)}
        </div>
      ))}
    </BlockStack>
  );
} 