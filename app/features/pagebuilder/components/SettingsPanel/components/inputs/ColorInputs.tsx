import React, { memo, useCallback, useState, useEffect } from 'react';
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

function hexToHSBA(hex: string): HSBAColor | null {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  let r, g, b, a = 1;
  if (hex.length === 3) {
    // Convert 3-digit hex to 6-digit
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  } else if (hex.length === 8) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
    a = parseInt(hex.substring(6, 8), 16) / 255;
  } else {
    return null;
  }

  // Convert RGB to HSB
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    hue: h * 360,
    saturation: s,
    brightness: v,
    alpha: a
  };
}

function hsbaToHex(color: HSBAColor): string {
  // Convert HSBA to RGB
  const h = color.hue / 360;
  const s = color.saturation;
  const v = color.brightness;
  const a = color.alpha ?? 1;

  let r, g, b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: r = 0; g = 0; b = 0;
  }

  // Convert RGB to hex
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  
  // Add alpha if not 1
  if (a < 1) {
    return `${hex}${toHex(a)}`;
  }
  
  return hex;
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
  const [hexInput, setHexInput] = useState(() => hsbaToHex(color).replace('#', ''));

  const togglePopoverActive = useCallback(
    () => setPopoverActive((active) => !active),
    [],
  );

  const handleHexChange = useCallback((value: string) => {
    const cleanValue = value.replace('#', '');
    setHexInput(cleanValue);
    const hsba = hexToHSBA(cleanValue);
    if (hsba) {
      onChange(hsba);
    }
  }, [onChange]);

  const handleColorPickerChange = useCallback((newColor: HSBAColor) => {
    const newHex = hsbaToHex(newColor).replace('#', '');
    setHexInput(newHex);
    onChange(newColor);
  }, [onChange]);

  // Update hex input when color prop changes
  useEffect(() => {
    const newHex = hsbaToHex(color).replace('#', '');
    if (newHex.replace('#', '') !== hexInput) {
      setHexInput(newHex);
    }
  }, [color]);

  const CustomColorIcon = () => (
    <Icon source={() => (
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: `#${hexInput}`
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
      #{hexInput}
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
        <BlockStack gap="400">
          <ColorPicker onChange={handleColorPickerChange} color={color} allowAlpha={allowAlpha} />
          <TextField
            label="Hex Color"
            value={hexInput}
            onChange={handleHexChange}
            autoComplete="off"
            prefix="#"
            monospaced
          />
        </BlockStack>
      </Box>
    </Popover>
  );
});

export const ColorInput = memo(function ColorInput({
  field,
  value,
  onChange
}: ColorInputProps<ColorField>) {
  const handleChange = useCallback((hsbaColor: HSBAColor) => {
    // Convert HSBA to hex before sending it up
    const hexColor = hsbaToHex(hsbaColor);
    onChange(hexColor);
  }, [onChange]);

  // Convert hex to HSBA for the color picker
  const hsbaColor = value && value.startsWith('#') 
    ? hexToHSBA(value) ?? { hue: 0, saturation: 0, brightness: 1 }
    : { hue: 0, saturation: 0, brightness: 1 };

  return (
    <BlockStack gap="200">
      <Text as="span" variant="bodyMd">
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </Text>
      <ColorPickerPopover
        color={hsbaColor}
        onChange={handleChange}
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

interface GradientValue {
  colors: string[];
  angle: number;
}

export const ColorBackgroundInput = memo(function ColorBackgroundInput({
  field,
  value,
  onChange
}: ColorInputProps<ColorBackgroundField>) {
  const [isGradient, setIsGradient] = useState(false);

  const handleGradientToggle = useCallback(() => {
    setIsGradient((current) => !current);
    // Reset value when switching between solid and gradient
    onChange(isGradient ? '#000000' : { colors: ['#000000', '#ffffff'], angle: 90 });
  }, [isGradient, onChange]);

  const handleColorChange = useCallback((index: number) => (hsbaColor: HSBAColor) => {
    const hexColor = hsbaToHex(hsbaColor);
    if (typeof value === 'object' && 'colors' in value) {
      const newColors = [...value.colors];
      newColors[index] = hexColor;
      onChange({ ...value, colors: newColors });
    } else {
      onChange(hexColor);
    }
  }, [value, onChange]);

  const handleAngleChange = useCallback((newAngle: string) => {
    if (typeof value === 'object' && 'colors' in value) {
      onChange({ ...value, angle: Number(newAngle) });
    }
  }, [value, onChange]);

  // Convert hex to HSBA for the color picker
  const getHSBAColor = useCallback((hexColor: string | undefined) => {
    return hexColor && hexColor.startsWith('#')
      ? hexToHSBA(hexColor) ?? { hue: 0, saturation: 0, brightness: 1 }
      : { hue: 0, saturation: 0, brightness: 1 };
  }, []);

  const isGradientValue = typeof value === 'object' && 'colors' in value;

  return (
    <BlockStack gap="200">
      <Text as="span" variant="bodyMd">
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </Text>

      {field.allowGradient && (
        <Button
          onClick={handleGradientToggle}
          pressed={isGradientValue}
        >
          {isGradientValue ? 'Switch to Solid Color' : 'Switch to Gradient'}
        </Button>
      )}

      {isGradientValue ? (
        <BlockStack gap="200">
          <ColorPickerPopover
            color={getHSBAColor(value.colors[0])}
            onChange={handleColorChange(0)}
            allowAlpha={field.allowAlpha}
          />
          <ColorPickerPopover
            color={getHSBAColor(value.colors[1])}
            onChange={handleColorChange(1)}
            allowAlpha={field.allowAlpha}
          />
          <TextField
            label="Gradient Angle"
            type="number"
            value={value.angle.toString()}
            onChange={handleAngleChange}
            autoComplete="off"
            suffix="°"
            min={0}
            max={360}
          />
        </BlockStack>
      ) : (
        <ColorPickerPopover
          color={getHSBAColor(value as string)}
          onChange={handleColorChange(0)}
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