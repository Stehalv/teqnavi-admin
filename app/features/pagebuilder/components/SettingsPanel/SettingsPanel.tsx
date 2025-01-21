import React, { useState } from 'react';
import { Card, Tabs, Text, BlockStack, Box, Banner } from '@shopify/polaris';
import { SettingsForm } from './SettingsForm.js';
import { PageSettingsForm } from './PageSettingsForm.js';
import { TemplateEditorModal } from '../TemplateEditor/TemplateEditorModal.js';
import type { Section } from '../../types/shopify.js';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import type { SettingField } from '../../types/settings.js';

interface SettingsPanelProps {
  selectedSectionKey: string | null;
  section: Section | null;
  selectedBlockKey: string | null;
}

// Helper function to convert Shopify setting fields to our internal format
function convertSettingField(field: any): SettingField {
  const baseField = {
    id: field.id,
    label: field.label,
    helpText: field.info,
    default: field.default,
  };

  switch (field.type) {
    case 'checkbox':
      return { ...baseField, type: 'checkbox' };
    case 'number':
      return { ...baseField, type: 'number', min: field.min, max: field.max, step: field.step, unit: field.unit };
    case 'radio':
      return { ...baseField, type: 'radio', options: field.options };
    case 'range':
      return { ...baseField, type: 'range', min: field.min || 0, max: field.max || 100, step: field.step || 1 };
    case 'select':
      return { ...baseField, type: 'select', options: field.options };
    case 'text':
      return { ...baseField, type: 'text', placeholder: field.placeholder };
    case 'textarea':
      return { ...baseField, type: 'textarea', placeholder: field.placeholder };
    case 'color':
      return { ...baseField, type: 'color' };
    case 'image_picker':
      return { ...baseField, type: 'image_picker' };
    case 'url':
      return { ...baseField, type: 'url', placeholder: field.placeholder };
    default:
      // For any other field type, default to text
      return { ...baseField, type: 'text' };
  }
}

export function SettingsPanel({ selectedSectionKey, section, selectedBlockKey }: SettingsPanelProps) {
  const { sectionRegistry } = usePageBuilder();
  const [selectedTab, setSelectedTab] = useState<string>('settings');
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);

  console.log('SettingsPanel props:', { selectedSectionKey, selectedBlockKey, section });

  // If no section is selected, show page settings
  if (!selectedSectionKey || !section) {
    return (
      <Card>
        <Box padding="400">
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">Page Settings</Text>
            <PageSettingsForm />
          </BlockStack>
        </Box>
      </Card>
    );
  }

  const schema = sectionRegistry[section.type]?.schema;

  // If schema is not found, show error state
  if (!schema) {
    return (
      <Banner tone="critical">
        <Text as="p">Schema not found for section type: {section.type}</Text>
      </Banner>
    );
  }

  const tabs = [
    {
      id: 'settings',
      content: 'Settings',
      accessibilityLabel: 'Settings',
      panelID: 'settings-panel',
    },
    {
      id: 'edit-code',
      content: 'Edit Code',
      accessibilityLabel: 'Edit Code',
      panelID: 'edit-code-panel',
      onAction: () => {
        setIsTemplateEditorOpen(true);
      }
    }
  ];

  // If a block is selected, get its schema and settings
  let blockSchema: SettingField[] = [];
  let blockSettings: Record<string, any> = {};
  if (selectedBlockKey && section.blocks && section.blocks[selectedBlockKey]) {
    const block = section.blocks[selectedBlockKey];
    const blockType = block.type;
    const foundBlockSchema = schema.blocks?.find(b => b.type === blockType)?.settings;
    if (foundBlockSchema) {
      blockSchema = foundBlockSchema.map(convertSettingField);
    }
    blockSettings = block.settings || {};
  }

  return (
    <Card>
      <Tabs
        tabs={tabs}
        selected={tabs.findIndex(tab => tab.id === selectedTab)}
        onSelect={(index) => setSelectedTab(tabs[index].id)}
      >
        <Box padding="400">
            <BlockStack gap="400">
              {selectedBlockKey && section.blocks?.[selectedBlockKey] ? (
                <>
                  <Text variant="headingMd" as="h2">Block Settings</Text>
                  <SettingsForm 
                    sectionKey={selectedSectionKey}
                    section={{ type: section.blocks[selectedBlockKey].type, settings: blockSettings }}
                    schema={blockSchema}
                    blockKey={selectedBlockKey}
                  />
                </>
              ) : (
                <>
                  <Text variant="headingMd" as="h2">Section Settings</Text>
                  <SettingsForm 
                    sectionKey={selectedSectionKey}
                    section={section}
                    schema={schema.settings.map(convertSettingField)}
                  />
                </>
              )}
            </BlockStack>
        </Box>
      </Tabs>
      <TemplateEditorModal
        open={isTemplateEditorOpen}
        onClose={() => {
          setIsTemplateEditorOpen(false);
          setSelectedTab('settings');
        }}
        sectionType={section.type}
      />
    </Card>
  );
} 