import React, { useState } from 'react';
import { Card, Tabs, Text, BlockStack, Box, Banner } from '@shopify/polaris';
import { SettingsForm } from './SettingsForm.js';
import { PageSettingsForm } from './PageSettingsForm.js';
import { CSSEditor } from './CSSEditor.js';
import type { Section } from '../../types/shopify.js';
import { usePageBuilder } from '../../context/PageBuilderContext.js';

interface SettingsPanelProps {
  selectedSectionKey: string | null;
  section: Section | null;
}

export function SettingsPanel({ selectedSectionKey, section }: SettingsPanelProps) {
  const { sectionRegistry } = usePageBuilder();
  const [selectedTab, setSelectedTab] = useState<string>('settings');

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
      id: 'styles',
      content: 'CSS',
      accessibilityLabel: 'CSS Editor',
      panelID: 'css-panel',
    },
  ];

  return (
    <Card>
      <Tabs
        tabs={tabs}
        selected={tabs.findIndex(tab => tab.id === selectedTab)}
        onSelect={(index) => setSelectedTab(tabs[index].id)}
      >
        <Box padding="400">
          {selectedTab === 'settings' ? (
            <SettingsForm 
              sectionKey={selectedSectionKey}
              section={section}
              schema={schema.settings}
            />
          ) : (
            <CSSEditor
              sectionKey={selectedSectionKey}
              sectionType={section.type}
              initialValue={section.styles}
            />
          )}
        </Box>
      </Tabs>
    </Card>
  );
} 