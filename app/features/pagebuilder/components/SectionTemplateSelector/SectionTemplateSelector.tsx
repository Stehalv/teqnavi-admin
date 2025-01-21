import React, { memo, useCallback } from 'react';
import { Popover, ActionList, Box, Spinner, Text, InlineStack, Button } from '@shopify/polaris';
import type { ActionListSection } from '@shopify/polaris';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import { useFetcher } from '@remix-run/react';
import type { SectionDefinition } from '../../services/template.server.js';
import type { Section } from '../../types/shopify.js';
import styles from './SectionTemplateSelector.module.css';

interface SectionTemplateSelectorProps {
  active: boolean;
  activator: React.ReactElement;
  onClose: () => void;
}

interface LoaderData {
  sections: SectionDefinition[];
  error?: string;
}

export const SectionTemplateSelector = memo(function SectionTemplateSelector({
  active,
  activator,
  onClose
}: SectionTemplateSelectorProps) {
  const { addSection, page } = usePageBuilder();
  const fetcher = useFetcher<LoaderData>();

  // Load section definitions when popover becomes active
  React.useEffect(() => {
    if (active && !fetcher.data && fetcher.state === 'idle') {
      fetcher.load('/api/sections');
    }
  }, [active, fetcher]);

  const handleSectionSelect = useCallback(async (sectionDef: SectionDefinition) => {
    try {
      // Create a new section with default settings from the definition
      const defaultSettings = sectionDef.presets?.[0]?.settings || {};
      addSection(sectionDef.type, defaultSettings);
      onClose();
    } catch (err) {
      console.error('Failed to add section:', err);
    }
  }, [addSection, onClose]);

  const handleSectionCopy = useCallback((section: Section, sectionKey: string) => {
    try {
      // Copy the section with its current settings and blocks
      addSection(section.type, {
        ...section.settings,
        blocks: { ...section.blocks },
        block_order: [...(section.block_order ?? [])]
      });
      onClose();
    } catch (err) {
      console.error('Failed to copy section:', err);
    }
  }, [addSection, onClose]);

  const isLoading = fetcher.state !== 'idle';
  const error = fetcher.data?.error;
  const sections = fetcher.data?.sections || [];
  const existingSections = page?.data?.sections ? Object.entries(page.data.sections) : [];

  const actionListSections: ActionListSection[] = [
    {
      title: 'New from Templates',
      items: sections.map(section => ({
        content: section.name,
        onAction: () => handleSectionSelect(section)
      }))
    }
  ];

  if (existingSections.length > 0) {
    actionListSections.push({
      title: 'Copy Existing',
      items: existingSections.map(([key, section]) => ({
        content: `${section.type} (Copy)`,
        onAction: () => handleSectionCopy(section, key)
      }))
    });
  }

  return (
    <Popover
      active={active}
      activator={activator}
      onClose={onClose}
      preferredAlignment="left"
      preferredPosition="above"
    >
      <Box padding="0" minWidth="200px">
        {isLoading ? (
          <Box padding="400">
            <InlineStack gap="200" align="center">
              <Spinner size="small" />
              <Text as="span">Loading sections...</Text>
            </InlineStack>
          </Box>
        ) : error ? (
          <Box padding="400">
            <Text tone="critical" as="p">{error}</Text>
          </Box>
        ) : (
          <ActionList sections={actionListSections} />
        )}
      </Box>
    </Popover>
  );
}); 