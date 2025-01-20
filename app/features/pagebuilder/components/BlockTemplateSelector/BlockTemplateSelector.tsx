import React, { memo, useCallback, useState } from 'react';
import { Popover, ActionList, Box, Spinner, Text, InlineStack, Button, Icon } from '@shopify/polaris';
import { ChevronDownIcon } from '@shopify/polaris-icons';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import { useFetcher } from '@remix-run/react';
import type { BlockTemplateWithSchema } from '../../services/template.server.js';
import type { BlockType } from '../../types.js';
import styles from './BlockTemplateSelector.module.css';

interface BlockTemplateSelectorProps {
  active: boolean;
  activator: React.ReactElement<{
    onClick: () => void;
  }>;
  onClose: () => void;
  sectionId: string;
  sectionType: string;
}

interface LoaderData {
  templates: BlockTemplateWithSchema[];
  error?: string;
}

export const BlockTemplateSelector = memo(function BlockTemplateSelector({
  active,
  activator,
  onClose,
  sectionId,
  sectionType
}: BlockTemplateSelectorProps) {
  const { addBlock } = usePageBuilder();
  const [hoveredTemplate, setHoveredTemplate] = useState<BlockTemplateWithSchema | null>(null);
  const fetcher = useFetcher<LoaderData>();

  // Load templates when popover becomes active
  React.useEffect(() => {
    if (active && !fetcher.data && fetcher.state === 'idle') {
      fetcher.load(`/api/templates/${sectionType}/blocks`);
    }
  }, [active, fetcher, sectionType]);

  const handleTemplateSelect = useCallback(async (template: BlockTemplateWithSchema) => {
    try {
      addBlock(sectionId, template.type as BlockType);
      onClose();
    } catch (err) {
      console.error('Failed to insert block template:', err);
    }
  }, [addBlock, sectionId, onClose]);

  const renderPreview = () => {
    if (!hoveredTemplate) return null;

    return (
      <Box padding="400" borderInlineStartWidth="025">
        <div className={styles.preview}>
          <Text variant="headingSm" as="h3">{hoveredTemplate.name}</Text>
          <Text variant="bodySm" as="p" tone="subdued">Type: {hoveredTemplate.type}</Text>
          
          <div className={styles.previewContent}>
            <Text variant="headingXs" as="h4">Settings</Text>
            <pre className={styles.previewCode}>
              {JSON.stringify(hoveredTemplate.schema, null, 2)}
            </pre>
          </div>
        </div>
      </Box>
    );
  };

  const isLoading = fetcher.state !== 'idle';
  const error = fetcher.data?.error;
  const templates = fetcher.data?.templates || [];

  return (
    <Popover
      active={active}
      activator={activator}
      onClose={onClose}
      preferredAlignment="left"
      preferredPosition="above"
    >
      <div className={styles.container}>
        <InlineStack gap="0">
          <Box padding="0" minWidth="200px">
            {isLoading ? (
              <Box padding="400">
                <InlineStack gap="200" align="center">
                  <Spinner size="small" />
                  <Text as="span">Loading block templates...</Text>
                </InlineStack>
              </Box>
            ) : error ? (
              <Box padding="400">
                <Text tone="critical" as="p">{error}</Text>
              </Box>
            ) : templates.length === 0 ? (
              <Box padding="400">
                <Text as="p">No block templates available</Text>
              </Box>
            ) : (
              <ActionList
                items={templates.map(template => ({
                  content: template.name,
                  onAction: () => handleTemplateSelect(template),
                  onMouseEnter: () => setHoveredTemplate(template),
                  onMouseLeave: () => setHoveredTemplate(null),
                  suffix: <Icon source={ChevronDownIcon} />
                }))}
              />
            )}
          </Box>
          {hoveredTemplate && renderPreview()}
        </InlineStack>
      </div>
    </Popover>
  );
}); 