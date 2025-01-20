import React, { memo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, InlineStack, Button, Text, Icon } from '@shopify/polaris';
import { DragHandleIcon, DeleteIcon } from '@shopify/polaris-icons';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import type { Block as BlockType } from '../../types/shopify.js';
import styles from './Block.module.css';

interface BlockProps {
  block: BlockType;
  blockKey: string;
  parentKey: string;
  isSelected: boolean;
}

export const Block = memo(function Block({ 
  block,
  blockKey,
  parentKey,
  isSelected
}: BlockProps) {
  const { 
    selectBlock,
    deleteBlock
  } = usePageBuilder();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: blockKey,
    data: {
      type: 'BLOCK',
      parentKey
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    selectBlock(blockKey);
  }, [blockKey, selectBlock]);

  const handleDelete = useCallback(() => {
    deleteBlock(parentKey, blockKey);
  }, [parentKey, blockKey, deleteBlock]);

  const getBlockLabel = () => {
    switch (block.type) {
      case 'text':
        return block.settings.text.substring(0, 30) + (block.settings.text.length > 30 ? '...' : '');
      case 'image':
        return block.settings.alt || 'Image';
      case 'button':
        return block.settings.text;
      case 'product':
        return 'Product: ' + block.settings.product_id;
      default:
        return 'Unknown Block';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.block} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
    >
      <Card padding="200">
        <InlineStack align="space-between">
          <InlineStack gap="200">
            <div {...attributes} {...listeners} className={styles.dragHandle}>
              <Icon source={DragHandleIcon} />
            </div>
            <Text as="span" variant="bodyMd">
              {getBlockLabel()}
            </Text>
          </InlineStack>
          <Button
            icon={DeleteIcon}
            onClick={handleDelete}
            accessibilityLabel="Delete block"
            tone="critical"
            variant="plain"
          />
        </InlineStack>
      </Card>
    </div>
  );
}); 