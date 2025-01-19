import React, { useState, useCallback } from "react";
import {
  Select,
  TextField,
  Button,
  Modal,
  ResourceList,
  ResourceItem,
  Text,
  BlockStack,
  InlineStack,
  Tag
} from "@shopify/polaris";
import type {
  FontPickerField,
  LinkListField,
  LiquidField,
  MetaobjectField,
  MetaobjectListField
} from "../../../../types/settings.js";

interface InputProps<T> {
  field: T;
  value: any;
  onChange: (value: any) => void;
}

interface Link {
  title: string;
  url: string;
}

export function FontPickerInput({ field, value, onChange }: InputProps<FontPickerField>) {
  // In a real implementation, this would fetch available fonts from Shopify
  const fonts = [
    { label: "System", value: "-apple-system" },
    { label: "Arial", value: "arial" },
    { label: "Helvetica", value: "helvetica" },
    { label: "Times New Roman", value: "times new roman" }
  ];

  return (
    <Select
      label={field.label}
      options={fonts}
      value={value ?? field.defaultValue ?? fonts[0].value}
      helpText={field.helpText}
      onChange={onChange}
    />
  );
}

export function LinkListInput({ field, value, onChange }: InputProps<LinkListField>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const links: Link[] = value ?? [];

  const handleAddLink = useCallback(() => {
    const newLinks = [...links, { title: newTitle, url: newUrl }];
    onChange(newLinks);
    setNewTitle("");
    setNewUrl("");
    setIsModalOpen(false);
  }, [links, newTitle, newUrl, onChange]);

  const handleRemoveLink = useCallback((index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    onChange(newLinks);
  }, [links, onChange]);

  return (
    <BlockStack gap="400">
      <Text variant="bodyMd" as="p">
        {field.label}
      </Text>

      <ResourceList
        items={links.map((link, index) => ({ ...link, id: index }))}
        renderItem={(item) => {
          const index = item.id as number;
          return (
            <ResourceItem
              id={`link-${index}`}
              onClick={() => {}}
              shortcutActions={[
                {
                  content: "Remove",
                  onAction: () => handleRemoveLink(index)
                }
              ]}
            >
              <Text variant="bodyMd" as="h3">
                {item.title}
              </Text>
              <Text variant="bodySm" as="p">
                {item.url}
              </Text>
            </ResourceItem>
          );
        }}
      />

      {(!field.maxLinks || links.length < field.maxLinks) && (
        <Button onClick={() => setIsModalOpen(true)}>Add Link</Button>
      )}

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Link"
        primaryAction={{
          content: "Add",
          onAction: handleAddLink,
          disabled: !newTitle || !newUrl
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setIsModalOpen(false)
          }
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <TextField
              label="Title"
              value={newTitle}
              onChange={setNewTitle}
              autoComplete="off"
            />
            <TextField
              label="URL"
              value={newUrl}
              onChange={setNewUrl}
              autoComplete="off"
              type="url"
            />
          </BlockStack>
        </Modal.Section>
      </Modal>

      {field.helpText && (
        <Text variant="bodySm" tone="subdued" as="p">
          {field.helpText}
        </Text>
      )}
    </BlockStack>
  );
}

export function LiquidInput({ field, value, onChange }: InputProps<LiquidField>) {
  return (
    <TextField
      label={field.label}
      value={value ?? field.defaultValue ?? ""}
      onChange={onChange}
      multiline={4}
      monospaced
      placeholder={field.placeholder}
      helpText={field.helpText}
      autoComplete="off"
    />
  );
}

export function MetaobjectInput({ field, value, onChange }: InputProps<MetaobjectField>) {
  // In a real implementation, this would fetch metaobjects from Shopify
  return (
    <Select
      label={field.label}
      options={[]}
      value={value ?? ""}
      onChange={onChange}
      helpText={field.helpText}
      placeholder="Select a metaobject"
    />
  );
}

export function MetaobjectListInput({ field, value, onChange }: InputProps<MetaobjectListField>) {
  // In a real implementation, this would fetch metaobjects from Shopify
  const selectedIds: string[] = value ?? [];
  
  return (
    <BlockStack gap="400">
      <Text variant="bodyMd" as="p">
        {field.label}
      </Text>
      
      <InlineStack gap="200" wrap>
        {selectedIds.map((id: string) => (
          <Tag key={id} onRemove={() => {
            const newIds = selectedIds.filter((i: string) => i !== id);
            onChange(newIds);
          }}>
            {id}
          </Tag>
        ))}
      </InlineStack>

      <Button onClick={() => {
        // In a real implementation, this would open a modal to select metaobjects
        const newId = `metaobject-${selectedIds.length + 1}`;
        onChange([...selectedIds, newId]);
      }}>
        Add Metaobject
      </Button>

      {field.helpText && (
        <Text variant="bodySm" tone="subdued" as="p">
          {field.helpText}
        </Text>
      )}
    </BlockStack>
  );
} 