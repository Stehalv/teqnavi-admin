import React, { memo } from 'react';
import {
  Button,
  Text,
  BlockStack,
  InlineStack,
  Icon,
  TextField
} from '@shopify/polaris';
import {
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  TextBlockIcon
} from '@shopify/polaris-icons';
import type {
  TextAlignmentField,
  UrlField,
  BaseSettingField
} from '../../../../types/settings.js';
import styles from '../../SettingsPanel.module.css';

interface LayoutInputProps<T extends BaseSettingField> {
  field: T;
  value: string;
  onChange: (value: string) => void;
}

type AlignmentValue = 'left' | 'center' | 'right' | 'justify';

interface AlignmentOption {
  value: AlignmentValue;
  label: string;
  icon: React.FunctionComponent;
}

const alignmentOptions: AlignmentOption[] = [
  {
    value: 'left',
    label: 'Align left',
    icon: TextAlignLeftIcon
  },
  {
    value: 'center',
    label: 'Align center',
    icon: TextAlignCenterIcon
  },
  {
    value: 'right',
    label: 'Align right',
    icon: TextAlignRightIcon
  },
  {
    value: 'justify',
    label: 'Justify',
    icon: TextBlockIcon
  }
];

export const TextAlignmentInput = memo(function TextAlignmentInput({
  field,
  value,
  onChange
}: LayoutInputProps<TextAlignmentField>) {
  const availableOptions = field.options || ['left', 'center', 'right', 'justify'];

  return (
    <BlockStack gap="200">
      <Text as="span" variant="bodyMd">
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </Text>

      <InlineStack gap="200">
        {alignmentOptions
          .filter(option => availableOptions.includes(option.value))
          .map(option => (
            <Button
              key={option.value}
              icon={option.icon}
              onClick={() => onChange(option.value)}
              pressed={value === option.value}
              variant="tertiary"
              accessibilityLabel={option.label}
            />
          ))}
      </InlineStack>

      {field.helpText && (
        <Text as="span" variant="bodySm" tone="subdued">
          {field.helpText}
        </Text>
      )}
    </BlockStack>
  );
});

export const UrlInput = memo(function UrlInput({
  field,
  value,
  onChange
}: LayoutInputProps<UrlField>) {
  const validateUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <TextField
      label={
        <>
          {field.label}
          {field.required && <span className={styles.required}>*</span>}
        </>
      }
      value={value}
      onChange={onChange}
      autoComplete="off"
      placeholder={field.placeholder}
      helpText={field.helpText}
      error={value && !validateUrl(value) ? 'Please enter a valid URL' : undefined}
      prefix={field.suggestInternal ? '/' : undefined}
      type="url"
    />
  );
}); 