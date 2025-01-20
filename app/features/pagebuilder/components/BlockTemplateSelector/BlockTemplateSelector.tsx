import React, { memo, useCallback, useState } from 'react';
import { Popover, ActionList, Box, Spinner, Text, InlineStack, Button, Icon } from '@shopify/polaris';
import { ChevronDownIcon } from '@shopify/polaris-icons';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import { useFetcher } from '@remix-run/react';
import type { SectionDefinition } from '../../types/templates.js';
import type { BlockType } from '../../types/shopify.js';
import styles from './BlockTemplateSelector.module.css';

interface BlockTemplateSelectorProps {
  active: boolean;
  activator: React.ReactElement<{
    onClick: () => void;
  }>;
  onClose: () => void;
  sectionKey: string;
  sectionType: string;
}

interface LoaderData {
  blockTypes: Array<{
    type: string;
    name: string;
    schema: object;
  }>;
  error?: string;
}

export const BlockTemplateSelector = memo(function BlockTemplateSelector({
  active,
  activator,
  onClose,
  sectionKey,
  sectionType
}: BlockTemplateSelectorProps) {
  const { addBlock } = usePageBuilder();
  const [hoveredBlockType, setHoveredBlockType] = useState<LoaderData['blockTypes'][0] | null>(null);
  const fetcher = useFetcher<LoaderData>();

  // Load block types when popover becomes active
  React.useEffect(() => {
    if (active && !fetcher.data && fetcher.state === 'idle') {
      fetcher.load(`/api/sections/${sectionType}/blocks`);
    }
  }, [active, fetcher, sectionType]);

  const handleBlockTypeSelect = useCallback(async (blockType: LoaderData['blockTypes'][0]) => {
    try {
      addBlock(sectionKey, blockType.type);
      onClose();
    } catch (err) {
      console.error('Failed to add block:', err);
    }
  }, [addBlock, sectionKey, onClose]);

  const renderPreview = () => {
    if (!hoveredBlockType) return null;

    return (
      <Box padding="400" borderInlineStartWidth="025">
        <div className={styles.preview}>
          <Text variant="headingSm" as="h3">{hoveredBlockType.name}</Text>
          <Text variant="bodySm" as="p" tone="subdued">Type: {hoveredBlockType.type}</Text>
          
          <div className={styles.previewContent}>
            <Text variant="headingXs" as="h4">Settings</Text>
            <pre className={styles.previewCode}>
              {JSON.stringify(hoveredBlockType.schema, null, 2)}
            </pre>
          </div>
        </div>
      </Box>
    );
  };

  const isLoading = fetcher.state !== 'idle';
  const error = fetcher.data?.error;
  const blockTypes = fetcher.data?.blockTypes || [];

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
                  <Text as="span">Loading block types...</Text>
                </InlineStack>
              </Box>
            ) : error ? (
              <Box padding="400">
                <Text tone="critical" as="p">{error}</Text>
              </Box>
            ) : blockTypes.length === 0 ? (
              <Box padding="400">
                <Text as="p">No block types available</Text>
              </Box>
            ) : (
              <ActionList
                items={blockTypes.map(blockType => ({
                  content: blockType.name,
                  onAction: () => handleBlockTypeSelect(blockType),
                  onMouseEnter: () => setHoveredBlockType(blockType),
                  onMouseLeave: () => setHoveredBlockType(null),
                  suffix: <Icon source={ChevronDownIcon} />
                }))}
              />
            )}
          </Box>
          {hoveredBlockType && renderPreview()}
        </InlineStack>
      </div>
    </Popover>
  );
}); 