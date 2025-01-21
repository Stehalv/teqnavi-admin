import React, { memo, useCallback } from 'react';
import {
  TextField,
  Text,
  BlockStack,
  Button,
  InlineStack,
  Icon
} from '@shopify/polaris';
import {
  TextBoldIcon,
  TextItalicIcon,
  LinkIcon,
  ImageIcon,
  BulletIcon,
  TextTitleIcon
} from '@shopify/polaris-icons';
import type {
  HtmlField,
  InlineRichTextField,
  RichTextField,
  BaseSettingField
} from '../../../../types/settings.js';
import styles from '../../SettingsPanel.module.css';

interface RichContentInputProps<T extends BaseSettingField> {
  field: T;
  value: string;
  onChange: (value: string) => void;
}

interface ToolbarButton {
  id: string;
  label: string;
  icon: React.FunctionComponent;
  action: (text: string) => string;
}

const toolbarButtons: Record<string, ToolbarButton> = {
  bold: {
    id: 'bold',
    label: 'Bold',
    icon: TextBoldIcon,
    action: (text: string) => `**${text}**`
  },
  italic: {
    id: 'italic',
    label: 'Italic',
    icon: TextItalicIcon,
    action: (text: string) => `*${text}*`
  },
  link: {
    id: 'link',
    label: 'Link',
    icon: LinkIcon,
    action: (text: string) => `[${text}](url)`
  },
  image: {
    id: 'image',
    label: 'Image',
    icon: ImageIcon,
    action: (text: string) => `![${text}](url)`
  },
  list: {
    id: 'list',
    label: 'List',
    icon: BulletIcon,
    action: (text: string) => `- ${text}`
  },
  header: {
    id: 'header',
    label: 'Header',
    icon: TextTitleIcon,
    action: (text: string) => `# ${text}`
  }
};

const RichTextToolbar = memo(function RichTextToolbar({
  tools,
  onAction
}: {
  tools: string[];
  onAction: (action: (text: string) => string) => void;
}) {
  return (
    <InlineStack gap="200">
      {tools.map((tool) => {
        const button = toolbarButtons[tool];
        if (!button) return null;

        return (
          <Button
            key={button.id}
            icon={button.icon}
            onClick={() => onAction(button.action)}
            accessibilityLabel={button.label}
            variant="plain"
          />
        );
      })}
    </InlineStack>
  );
});

export const HtmlInput = memo(function HtmlInput({
  field,
  value,
  onChange
}: RichContentInputProps<HtmlField>) {
  return (
    <BlockStack gap="200">
      <Text as="span" variant="bodyMd">
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </Text>
      <TextField
        label=""
        value={value}
        onChange={onChange}
        multiline={4}
        monospaced
        placeholder={field.placeholder}
        autoComplete="off"
        helpText={field.helpText}
      />
    </BlockStack>
  );
});

export const InlineRichTextInput = memo(function InlineRichTextInput({
  field,
  value,
  onChange
}: RichContentInputProps<InlineRichTextField>) {
  // Convert undefined/null values to empty string
  const safeValue = value === undefined || value === null ? '' : String(value);

  const handleToolbarAction = useCallback((action: (text: string) => string) => {
    const textarea = document.querySelector(
      `textarea[name="${field.id}"]`
    ) as HTMLTextAreaElement;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = safeValue.substring(start, end);
      const newText =
        safeValue.substring(0, start) +
        action(selectedText || 'text') +
        safeValue.substring(end);
      onChange(newText);
    } else {
      onChange(action('text'));
    }
  }, [field.id, safeValue, onChange]);

  return (
    <BlockStack gap="200">
      <Text as="span" variant="bodyMd">
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </Text>
      <RichTextToolbar
        tools={field.toolbar || ['bold', 'italic', 'link']}
        onAction={handleToolbarAction}
      />
      <TextField
        label=""
        name={field.id}
        value={safeValue}
        onChange={onChange}
        multiline
        autoComplete="off"
        helpText={field.helpText}
      />
    </BlockStack>
  );
});

export const RichTextInput = memo(function RichTextInput({
  field,
  value,
  onChange
}: RichContentInputProps<RichTextField>) {
  // Convert undefined/null values to empty string
  const safeValue = value === undefined || value === null ? '' : String(value);

  const handleToolbarAction = useCallback((action: (text: string) => string) => {
    const textarea = document.querySelector(
      `textarea[name="${field.id}"]`
    ) as HTMLTextAreaElement;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = safeValue.substring(start, end);
      const newText =
        safeValue.substring(0, start) +
        action(selectedText || 'text') +
        safeValue.substring(end);
      onChange(newText);
    } else {
      onChange(action('text'));
    }
  }, [field.id, safeValue, onChange]);

  return (
    <BlockStack gap="200">
      <Text as="span" variant="bodyMd">
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </Text>
      <RichTextToolbar
        tools={field.toolbar || ['bold', 'italic', 'link', 'image', 'list', 'header']}
        onAction={handleToolbarAction}
      />
      <TextField
        label=""
        name={field.id}
        value={safeValue}
        onChange={onChange}
        multiline={6}
        autoComplete="off"
        helpText={field.helpText}
      />
    </BlockStack>
  );
}); 