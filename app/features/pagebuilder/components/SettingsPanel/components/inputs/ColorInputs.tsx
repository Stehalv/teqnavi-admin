import React, { memo, useCallback, useState } from 'react';
import {
  ColorPicker,
  Popover,
  Button,
  Box,
  Text,
  BlockStack,
  InlineStack,
  Icon,
  TextField
} from '@shopify/polaris';
import { ColorIcon } from '@shopify/polaris-icons';
import type {
  ColorField,
  ColorBackgroundField,
  ColorSchemeField,
  ColorSchemeGroupField,
  BaseSettingField
} from '../../../../types/settings.js';
import styles from '../../SettingsPanel.module.css';

interface ColorInputProps<T extends BaseSettingField> {
  field: T;
  value: any;
  onChange: (value: any) => void;
}

interface HSBAColor {
  hue: number;
  saturation: number;
  brightness: number;
  alpha?: number;
}

const ColorPickerPopover = memo(function ColorPickerPopover({
  color,
  onChange,
  allowAlpha = false,
  allowGradient = false
}: {
  color: HSBAColor;
  onChange: (color: HSBAColor) => void;
  allowAlpha?: boolean;
  allowGradient?: boolean;
}) {
  const [popoverActive, setPopoverActive] = useState(false);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((active) => !active),
    [],
  );

  const colorString = `hsla(${color.hue}, ${Math.round(color.saturation * 100)}%, ${Math.round(
    color.brightness * 100
  )}%, ${color.alpha ?? 1})`;

  const CustomColorIcon = () => (
    <Icon source={() => (
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: colorString
        }}
      />
    )} />
  );

  const activator = (
    <Button
      onClick={togglePopoverActive}
      disclosure
      textAlign="left"
      fullWidth
      icon={<CustomColorIcon />}
    >
      {colorString}
    </Button>
  );

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={togglePopoverActive}
      preferredAlignment="left"
    >
      <Box padding="400">
        <ColorPicker onChange={onChange} color={color} allowAlpha={allowAlpha} />
      </Box>
    </Popover>
  );
});

export const ColorInput = memo(function ColorInput({
  field,
  value,
  onChange
}: ColorInputProps<ColorField>) {
  return (
    <BlockStack gap="200">
      <Text as="span" variant="bodyMd">
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </Text>
      <ColorPickerPopover
        color={value ?? { hue: 0, saturation: 0, brightness: 1 }}
        onChange={onChange}
        allowAlpha={field.allowAlpha}
      />
      {field.helpText && (
        <Text as="span" variant="bodySm" tone="subdued">
          {field.helpText}
        </Text>
      )}
    </BlockStack>
  );
});

export const ColorBackgroundInput = memo(function ColorBackgroundInput({
  field,
  value,
  onChange
}: ColorInputProps<ColorBackgroundField>) {
  const [isGradient, setIsGradient] = useState(false);

  const handleGradientToggle = useCallback(() => {
    setIsGradient((current) => !current);
    // Reset value when switching between solid and gradient
    onChange(isGradient ? { hue: 0, saturation: 0, brightness: 1 } : []);
  }, [isGradient, onChange]);

  return (
    <BlockStack gap="200">
      <Text as="span" variant="bodyMd">
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </Text>

      {field.allowGradient && (
        <Button
          onClick={handleGradientToggle}
          pressed={isGradient}
        >
          {isGradient ? 'Switch to Solid Color' : 'Switch to Gradient'}
        </Button>
      )}

      {isGradient ? (
        <BlockStack gap="200">
          <ColorPickerPopover
            color={value[0] ?? { hue: 0, saturation: 0, brightness: 1 }}
            onChange={(color) => onChange([color, value[1] ?? color])}
            allowAlpha={field.allowAlpha}
          />
          <ColorPickerPopover
            color={value[1] ?? value[0] ?? { hue: 0, saturation: 0, brightness: 1 }}
            onChange={(color) => onChange([value[0], color])}
            allowAlpha={field.allowAlpha}
          />
          <TextField
            label="Gradient Angle"
            type="number"
            value={value.angle?.toString() ?? '90'}
            onChange={(newValue) => onChange({ ...value, angle: Number(newValue) })}
            autoComplete="off"
            suffix="°"
            min={0}
            max={360}
          />
        </BlockStack>
      ) : (
        <ColorPickerPopover
          color={value ?? { hue: 0, saturation: 0, brightness: 1 }}
          onChange={onChange}
          allowAlpha={field.allowAlpha}
        />
      )}

      {field.helpText && (
        <Text as="span" variant="bodySm" tone="subdued">
          {field.helpText}
        </Text>
      )}
    </BlockStack>
  );
});

export const ColorSchemeInput = memo(function ColorSchemeInput({
  field,
  value,
  onChange
}: ColorInputProps<ColorSchemeField>) {
  const CustomSchemeIcon = ({ colors }: { colors: HSBAColor[] }) => (
    <Icon source={() => (
      <div style={{ display: 'flex', gap: '4px' }}>
        {colors.map((color, index) => (
          <div
            key={index}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: `hsla(${color.hue}, ${color.saturation * 100}%, ${
                color.brightness * 100
              }%, ${color.alpha ?? 1})`
            }}
          />
        ))}
      </div>
    )} />
  );

  return (
    <BlockStack gap="200">
      <Text as="span" variant="bodyMd">
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </Text>

      <BlockStack gap="200">
        {field.options.map((scheme) => (
          <Button
            key={scheme.value}
            onClick={() => onChange(scheme.value)}
            pressed={value === scheme.value}
            textAlign="left"
            fullWidth
            icon={<CustomSchemeIcon colors={scheme.colors} />}
          >
            {scheme.label}
          </Button>
        ))}
      </BlockStack>

      {field.helpText && (
        <Text as="span" variant="bodySm" tone="subdued">
          {field.helpText}
        </Text>
      )}
    </BlockStack>
  );
});

export const ColorSchemeGroupInput = memo(function ColorSchemeGroupInput({
  field,
  value,
  onChange
}: ColorInputProps<ColorSchemeGroupField>) {
  return (
    <BlockStack gap="400">
      <Text as="span" variant="bodyMd">
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </Text>

      {field.schemes.map((scheme, index) => (
        <ColorSchemeInput
          key={index}
          field={scheme}
          value={value?.[index]}
          onChange={(schemeValue) => {
            const newValue = [...(value ?? [])];
            newValue[index] = schemeValue;
            onChange(newValue);
          }}
        />
      ))}

      {field.helpText && (
        <Text as="span" variant="bodySm" tone="subdued">
          {field.helpText}
        </Text>
      )}
    </BlockStack>
  );
}); 