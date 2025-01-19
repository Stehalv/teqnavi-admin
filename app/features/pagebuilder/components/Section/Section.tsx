import React, { memo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, BlockStack, InlineStack, Button, Text, Icon } from '@shopify/polaris';
import { DragHandleIcon, ChevronDownIcon, ChevronUpIcon, DeleteIcon } from '@shopify/polaris-icons';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import { Block } from '../Block/Block.js';
import type { Section as SectionType } from '../../types.js';
import styles from './Section.module.css';

interface SectionProps {
  section: SectionType;
  isSelected: boolean;
  selectedBlockId?: string;
  isDragging: boolean;
}

export const Section = memo(function Section({ 
  section,
  isSelected,
  selectedBlockId,
  isDragging
}: SectionProps) {
  const { 
    selectSection,
    deleteSection,
    addBlock,
    reorderBlocks
  } = usePageBuilder();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSectionDragging
  } = useSortable({
    id: section.id,
    data: {
      type: 'SECTION',
      parentId: null
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSectionDragging ? 0.5 : 1
  };

  const handleClick = useCallback(() => {
    selectSection(section.id);
  }, [section.id, selectSection]);

  const handleDelete = useCallback(() => {
    deleteSection(section.id);
  }, [section.id, deleteSection]);

  const handleAddBlock = useCallback(() => {
    addBlock(section.id, 'text');
  }, [section.id, addBlock]);

  const handleBlockReorder = useCallback((newOrder: string[]) => {
    reorderBlocks(section.id, newOrder);
  }, [section.id, reorderBlocks]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.section} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
    >
      <Card>
        <BlockStack gap="300">
          <InlineStack align="space-between">
            <InlineStack gap="200">
              <div {...attributes} {...listeners} className={styles.dragHandle}>
                <Icon source={DragHandleIcon} />
              </div>
              <Text as="h3" variant="headingSm">{section.type}</Text>
            </InlineStack>
            <InlineStack gap="200">
              <Button
                icon={DeleteIcon}
                onClick={handleDelete}
                accessibilityLabel="Delete section"
                tone="critical"
                variant="plain"
              />
            </InlineStack>
          </InlineStack>

          {isSelected && (
            <BlockStack gap="300">
              <div className={styles.blockList}>
                {section.block_order.map((blockId) => (
                  <Block
                    key={blockId}
                    block={section.blocks[blockId]}
                    isSelected={selectedBlockId === blockId}
                    parentId={section.id}
                  />
                ))}
              </div>
              <Button
                onClick={handleAddBlock}
                variant="plain"
                tone="success"
                fullWidth
              >
                Add Block
              </Button>
            </BlockStack>
          )}
        </BlockStack>
      </Card>
    </div>
  );
}); 