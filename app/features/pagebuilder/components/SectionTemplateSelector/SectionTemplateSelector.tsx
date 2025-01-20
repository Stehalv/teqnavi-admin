import React, { memo, useCallback } from 'react';
import { Popover, ActionList, Box, Spinner, Text, InlineStack, Button } from '@shopify/polaris';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import { useFetcher } from '@remix-run/react';
import type { SectionTemplateWithBlocks } from '../../services/template.server.js';
import type { SectionUI, SectionType } from '../../types/shopify.js';
import styles from './SectionTemplateSelector.module.css';
import { getDefaultSectionSettings } from '../../utils/defaults.js';
import { v4 as uuidv4 } from 'uuid';

interface SectionTemplateSelectorProps {
  active: boolean;
  activator: React.ReactElement;
  onClose: () => void;
}

interface LoaderData {
  templates: SectionTemplateWithBlocks[];
  error?: string;
}

export const SectionTemplateSelector = memo(function SectionTemplateSelector({
  active,
  activator,
  onClose
}: SectionTemplateSelectorProps) {
  const { addSection, page } = usePageBuilder();
  const fetcher = useFetcher<LoaderData>();

  // Load templates when popover becomes active
  React.useEffect(() => {
    if (active && !fetcher.data && fetcher.state === 'idle') {
      fetcher.load('/api/templates');
    }
  }, [active, fetcher]);

  const handleTemplateSelect = useCallback(async (template: SectionTemplateWithBlocks) => {
    try {
      const newSection: SectionUI = {
        id: uuidv4(),
        templateId: template.id,
        type: template.type,
        settings: getDefaultSectionSettings(template.type as SectionType),
        blocks: {},
        block_order: []
      };
      addSection(newSection);
      onClose();
    } catch (err) {
      console.error('Failed to insert template:', err);
    }
  }, [addSection, onClose]);

  const handleSectionCopy = useCallback((section: SectionUI) => {
    try {
      const newSection: SectionUI = {
        id: uuidv4(),
        templateId: section.templateId,
        type: section.type,
        settings: { ...section.settings },
        blocks: { ...section.blocks },
        block_order: [...section.block_order]
      };
      addSection(newSection);
      onClose();
    } catch (err) {
      console.error('Failed to copy section:', err);
    }
  }, [addSection, onClose]);

  const isLoading = fetcher.state !== 'idle';
  const error = fetcher.data?.error;
  const templates = fetcher.data?.templates || [];
  const existingSections = page?.data?.sections ? Object.values(page.data.sections) : [];

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
              <Text as="span">Loading templates...</Text>
            </InlineStack>
          </Box>
        ) : error ? (
          <Box padding="400">
            <Text tone="critical" as="p">{error}</Text>
          </Box>
        ) : (
          <ActionList
            sections={[
              {
                title: 'New from Templates',
                items: templates.map(template => ({
                  content: template.name,
                  onAction: () => handleTemplateSelect(template)
                }))
              },
              {
                title: 'Copy Existing',
                items: existingSections.map(section => ({
                  content: `${section.type} (Copy)`,
                  onAction: () => handleSectionCopy(section)
                }))
              }
            ]}
          />
        )}
      </Box>
      <Box padding="300" borderBlockStartWidth="025">
        <Button
          fullWidth
          onClick={() => {
            // Placeholder for AI generation
            console.log('AI generation clicked');
          }}
        >
          Generate with AI
        </Button>
      </Box>
    </Popover>
  );
}); 