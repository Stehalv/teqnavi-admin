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
      checked={value ?? field.defaultValue ?? false}
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
      value={value?.toString() ?? field.defaultValue?.toString() ?? ""}
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
  const handleChange = useCallback((value: number) => {
    onChange(value);
  }, [onChange]);

  return (
    <RangeSlider
      label={field.label}
      value={value ?? field.defaultValue ?? field.min}
      min={field.min}
      max={field.max}
      step={field.step}
      helpText={field.helpText}
      suffix={
        <Text as="span" variant="bodyMd">
          {value}
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
      value={value ?? field.defaultValue ?? ""}
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
  return (
    <TextField
      label={field.label}
      value={value ?? field.defaultValue ?? ""}
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
  return (
    <TextField
      label={field.label}
      value={value ?? field.defaultValue ?? ""}
      helpText={field.helpText}
      maxLength={field.maxLength}
      placeholder={field.placeholder}
      autoComplete="off"
      multiline={4}
      onChange={onChange}
    />
  );
}); 