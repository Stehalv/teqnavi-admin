import { 
  TextField, 
  Select, 
  BlockStack, 
  Text,
  Checkbox,
  RangeSlider,
  ColorPicker
} from "@shopify/polaris";
import { useState, useMemo } from "react";
import type { Block, ThemeAsset, JsonifyObject } from "../types.js";

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

export function BlockSettings({ 
  block,
  blockAsset,
  onChange
}: {
  block: Block;
  blockAsset: ThemeAsset | JsonifyObject<ThemeAsset>;
  onChange: (block: Block) => void;
}) {
  console.log('BlockSettings received:', {
    blockId: block.id,
    blockType: block.type,
    initialSettings: block.settings,
    assetContent: blockAsset?.content?.substring(0, 100) + '...'
  });

  const [settings, setSettings] = useState(block.settings);

  const handleSettingChange = (key: string, value: any) => {
    console.log('BlockSettings setting change:', { key, value });
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onChange({
      ...block,
      settings: newSettings
    });
  };

  // Get schema from block asset
  let schema;
  try {
    const schemaMatch = blockAsset.content.match(/{% schema %}([\s\S]*?){% endschema %}/);
    console.log('BlockSettings schema match:', schemaMatch ? 'Found schema' : 'No schema found');
    if (schemaMatch) {
      schema = JSON.parse(schemaMatch[1]);
      console.log('BlockSettings parsed schema:', schema);
    }
  } catch (e) {
    console.error('Error parsing block schema:', e);
    return null;
  }

  if (!schema) {
    console.log('BlockSettings: No schema found, returning null');
    return null;
  }

  const renderField = (field: any) => {
    if (field.type === 'header') {
      return (
        <Text as="h3" variant="headingSm">{field.content}</Text>
      );
    }

    switch (field.type) {
      case 'text':
        return (
          <TextField
            label={field.label}
            value={settings[field.id] || ''}
            onChange={(value) => handleSettingChange(field.id, value)}
            autoComplete="off"
            helpText={field.info}
          />
        );

      case 'select':
        return (
          <Select
            label={field.label}
            options={field.options}
            value={settings[field.id] || field.default}
            onChange={(value) => handleSettingChange(field.id, value)}
            helpText={field.info}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            label={field.label}
            checked={settings[field.id] || false}
            onChange={(checked) => handleSettingChange(field.id, checked)}
            helpText={field.info}
          />
        );

      case 'range':
        return (
          <RangeSlider
            label={field.label}
            value={settings[field.id] || field.default}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={(value) => handleSettingChange(field.id, value)}
            helpText={field.info}
          />
        );

      case 'color':
        return (
          <div>
            <Text as="p" variant="bodyMd">{field.label}</Text>
            <ColorPicker
              onChange={(color) => handleSettingChange(field.id, color)}
              color={settings[field.id] || field.default || '#000000'}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BlockStack gap="400">
      {schema.settings.map((field: any) => (
        <div key={field.id || field.content}>
          {renderField(field)}
        </div>
      ))}
    </BlockStack>
  );
} 