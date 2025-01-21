import React, { memo, useCallback, useMemo } from 'react';
import { Popover, ActionList, Box, Text } from '@shopify/polaris';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
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

interface BlockTypeInfo {
  type: string;
  name: string;
}

export const BlockTemplateSelector = memo(function BlockTemplateSelector({
  active,
  activator,
  onClose,
  sectionKey,
  sectionType
}: BlockTemplateSelectorProps) {
  const { addBlock, sectionRegistry } = usePageBuilder();

  const blockTypes = useMemo(() => {
    const sectionDefinition = sectionRegistry[sectionType];
    if (!sectionDefinition?.schema?.blocks) return [];

    return sectionDefinition.schema.blocks.map(block => ({
      type: block.type,
      name: block.name
    }));
  }, [sectionRegistry, sectionType]);

  const handleBlockTypeSelect = useCallback(async (blockType: BlockTypeInfo) => {
    try {
      addBlock(sectionKey, blockType.type);
      onClose();
    } catch (err) {
      console.error('Failed to add block:', err);
    }
  }, [addBlock, sectionKey, onClose]);

  return (
    <Popover
      active={active}
      activator={activator}
      onClose={onClose}
      preferredAlignment="left"
      preferredPosition="above"
    >
      <Box padding="0" minWidth="200px">
        {blockTypes.length === 0 ? (
          <Box padding="400">
            <Text as="p">No block types available</Text>
          </Box>
        ) : (
          <ActionList
            items={blockTypes.map(blockType => ({
              content: blockType.name,
              onAction: () => handleBlockTypeSelect(blockType)
            }))}
          />
        )}
      </Box>
    </Popover>
  );
}); 