import React, { memo, useCallback } from 'react';
import {
  Checkbox,
  TextField,
  RadioButton,
  RangeSlider,
  Select,
  Text,
  BlockStack
} from '@shopify/polaris';
import type {
  CheckboxField,
  NumberField,
  RadioField,
  RangeField,
  SelectField,
  TextField as TextFieldType,
  TextAreaField
} from '../../../../types/settings.js';
import styles from '../../SettingsPanel.module.css';

interface InputProps<T> {
  field: T;
  value: any;
  onChange: (value: any) => void;
}

export const CheckboxInput = memo(function CheckboxInput({
  field,
  value,
  onChange
}: InputProps<CheckboxField>) {
  return (
    <Checkbox
      label={field.label}
      checked={value ?? field.default ?? false}
      helpText={field.helpText}
      onChange={onChange}
    />
  );
});

export const NumberInput = memo(function NumberInput({
  field,
  value,
  onChange
}: InputProps<NumberField>) {
  return (
    <TextField
      label={field.label}
      type="number"
      value={value?.toString() ?? field.default?.toString() ?? ""}
      helpText={field.helpText}
      min={field.min}
      max={field.max}
      step={field.step}
      suffix={field.unit}
      autoComplete="off"
      onChange={onChange}
    />
  );
});

export const RadioInput = memo(function RadioInput({
  field,
  value,
  onChange
}: InputProps<RadioField>) {
  return (
    <BlockStack gap="200">
      <Text as="p" variant="bodyMd">
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </Text>
      <BlockStack gap="200">
        {field.options.map((option) => (
          <RadioButton
            key={option.value}
            label={option.label}
            checked={value === option.value}
            helpText={field.helpText}
            onChange={() => onChange(option.value)}
          />
        ))}
      </BlockStack>
    </BlockStack>
  );
});

export const RangeInput = memo(function RangeInput({
  field,
  value,
  onChange
}: InputProps<RangeField>) {
  const handleChange = useCallback((newValue: number) => {
    // If the original value has a unit (e.g. "33px"), extract it
    const unit = typeof value === 'string' ? value.replace(/[0-9]/g, '') : '';
    // Append the unit to the new value
    const finalValue = unit ? `${newValue}${unit}` : newValue;
    onChange(finalValue);
  }, [onChange, value]);

  // Extract numeric value from string with unit if needed
  const numericValue = typeof value === 'string' 
    ? parseInt(value.replace(/[^0-9]/g, ''), 10) 
    : value;

  return (
    <RangeSlider
      label={field.label}
      value={numericValue ?? field.default ?? field.min}
      min={field.min}
      max={field.max}
      step={field.step}
      helpText={field.helpText}
      suffix={
        <Text as="span" variant="bodyMd">
          {numericValue}
          {field.suffix && ` ${field.suffix}`}
          {field.unit && ` ${field.unit}`}
        </Text>
      }
      onChange={handleChange}
    />
  );
});

export const SelectInput = memo(function SelectInput({
  field,
  value,
  onChange
}: InputProps<SelectField>) {
  return (
    <Select
      label={field.label}
      options={field.options}
      value={value ?? field.default ?? ""}
      helpText={field.helpText}
      onChange={onChange}
    />
  );
});

export const TextInput = memo(function TextInput({
  field,
  value,
  onChange
}: InputProps<TextFieldType>) {
  // Convert undefined/null values to empty string
  const safeValue = value === undefined || value === null ? '' : String(value);
  const defaultValue = field.default === undefined || field.default === null ? '' : String(field.default);

  return (
    <TextField
      label={field.label}
      value={safeValue || defaultValue}
      helpText={field.helpText}
      maxLength={field.maxLength}
      placeholder={field.placeholder}
      autoComplete="off"
      multiline={field.multiline}
      onChange={onChange}
    />
  );
});

export const TextAreaInput = memo(function TextAreaInput({
  field,
  value,
  onChange
}: InputProps<TextAreaField>) {
  // Convert undefined/null values to empty string
  const safeValue = value === undefined || value === null ? '' : String(value);
  const defaultValue = field.default === undefined || field.default === null ? '' : String(field.default);

  return (
    <TextField
      label={field.label}
      value={safeValue || defaultValue}
      helpText={field.helpText}
      maxLength={field.maxLength}
      placeholder={field.placeholder}
      autoComplete="off"
      multiline={4}
      onChange={onChange}
    />
  );
}); 