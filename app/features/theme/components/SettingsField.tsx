import { TextField, Select, Checkbox, Text, RangeSlider, ColorPicker } from "@shopify/polaris";

export interface SchemaField {
  type: string;
  id: string;
  label: string;
  content?: string;
  default?: any;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  info?: string;
  options?: { label: string; value: string }[];
}

interface SettingsFieldProps {
  field: SchemaField;
  value: any;
  onChange: (value: any) => void;
}

export function SettingsField({ field, value, onChange }: SettingsFieldProps) {
  if (field.type === 'header') {
    return <Text as="h3" variant="headingSm">{field.content}</Text>;
  }

  const currentValue = value ?? field.default;

  switch (field.type) {
    case 'text':
    case 'textarea':
      return (
        <TextField
          label={field.label}
          value={currentValue?.toString() || ""}
          onChange={onChange}
          multiline={field.type === 'textarea'}
          autoComplete="off"
          helpText={field.info}
        />
      );

    case 'number':
    case 'range':
      return (
        <RangeSlider
          label={field.label}
          value={parseFloat(currentValue) || 0}
          onChange={onChange}
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
          value={currentValue || field.default}
          onChange={onChange}
          helpText={field.info}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          label={field.label}
          checked={currentValue || false}
          onChange={onChange}
          helpText={field.info}
        />
      );

    case 'color':
      return (
        <div>
          <Text as="p" variant="bodyMd">{field.label}</Text>
          <ColorPicker
            onChange={onChange}
            color={currentValue || field.default || '#000000'}
          />
        </div>
      );

    default:
      return null;
  }
} 