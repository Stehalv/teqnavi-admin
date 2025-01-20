import React, { memo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, InlineStack, Button, Text, Icon } from '@shopify/polaris';
import { DragHandleIcon, DeleteIcon } from '@shopify/polaris-icons';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import type { Section as SectionType } from '../../types/shopify.js';
import styles from './Section.module.css';

interface SectionProps {
  section: SectionType;
  sectionKey: string;
  isSelected: boolean;
  isDragging?: boolean;
}

export const Section = memo(function Section({ 
  section,
  sectionKey,
  isSelected,
  isDragging: externalIsDragging
}: SectionProps) {
  const { 
    selectSection,
    deleteSection
  } = usePageBuilder();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: internalIsDragging
  } = useSortable({
    id: sectionKey,
    data: {
      type: 'SECTION'
    }
  });

  const isDragging = externalIsDragging || internalIsDragging;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    selectSection(sectionKey);
  }, [sectionKey, selectSection]);

  const handleDelete = useCallback(() => {
    deleteSection(sectionKey);
  }, [sectionKey, deleteSection]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.section} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
    >
      <Card padding="200">
        <InlineStack align="space-between">
          <InlineStack gap="200">
            <div {...attributes} {...listeners} className={styles.dragHandle}>
              <Icon source={DragHandleIcon} />
            </div>
            <Text as="h3" variant="headingSm">{section.type}</Text>
          </InlineStack>
          <Button
            icon={DeleteIcon}
            onClick={handleDelete}
            accessibilityLabel="Delete section"
            tone="critical"
            variant="plain"
          />
        </InlineStack>
      </Card>
    </div>
  );
}); 