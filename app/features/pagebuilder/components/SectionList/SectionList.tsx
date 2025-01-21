import React, { memo, useState, useCallback } from 'react';
import { Text, Button, Icon, BlockStack, ButtonGroup, InlineStack } from '@shopify/polaris';
import { DragHandleIcon, DeleteIcon } from '@shopify/polaris-icons';
import type { 
  DragDropContext as DragDropContextType,
  Droppable as DroppableType,
  Draggable as DraggableType,
  DroppableProvided,
  DraggableProvided,
  DropResult as DndDropResult
} from 'react-beautiful-dnd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { PageUI, Block } from '../../types/shopify.js';
import { isSectionWithBlocks } from '../../types/shopify.js';
import { SectionTemplateSelector } from '../SectionTemplateSelector/SectionTemplateSelector.js';
import { BlockTemplateSelector } from '../BlockTemplateSelector/BlockTemplateSelector.js';
import styles from './SectionList.module.css';
import { usePageBuilder } from '../../context/PageBuilderContext.js';

interface SectionListProps {
  page: PageUI;
  selectedSectionKey?: string;
  onSelectSection: (sectionKey?: string) => void;
  onDeleteSection: (sectionKey: string) => void;
}

export const SectionList = memo(function SectionList({
  page,
  selectedSectionKey,
  onSelectSection,
  onDeleteSection
}: SectionListProps) {
  const [showSectionTemplates, setShowSectionTemplates] = useState(false);
  const [showBlockTemplates, setShowBlockTemplates] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const { sectionRegistry, deleteBlock, reorderBlocks, selectBlock } = usePageBuilder();

  const handleSectionClick = useCallback((sectionKey: string) => {
    if (selectedSectionKey === sectionKey) {
      setExpandedSections(prev => {
        const newSet = new Set(prev);
        if (prev.has(sectionKey)) {
          newSet.delete(sectionKey);
        } else {
          newSet.add(sectionKey);
        }
        return newSet;
      });
    } else {
      onSelectSection(sectionKey);
      setExpandedSections(prev => {
        const newSet = new Set(prev);
        newSet.add(sectionKey);
        return newSet;
      });
    }
  }, [selectedSectionKey, onSelectSection]);

  const handleDragEnd = (result: DndDropResult) => {
    if (!result.destination || !selectedSectionKey) return;

    const section = page.data.sections[selectedSectionKey];
    if (!section || !section.block_order) return;

    const newOrder = Array.from(section.block_order);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);

    reorderBlocks(selectedSectionKey, newOrder);
  };

  return (
    <div className={styles.sectionList}>
      <BlockStack gap="400">
        <div className={styles.section}>
          <div 
            className={styles.sectionHeader} 
            onClick={() => onSelectSection(undefined)}
          >
            <InlineStack align="space-between" blockAlign="center">
              <Text as="p" variant="bodyMd">Page</Text>
            </InlineStack>
          </div>
        </div>
        <Text as="h2" variant="headingMd">Sections</Text>
        <div className={styles.sections}>
          {page.data.order.map((sectionKey: string) => {
            const section = page.data.sections[sectionKey];
            const sectionDefinition = sectionRegistry[section.type];
            const isSelected = selectedSectionKey === sectionKey;
            const hasBlocks = section.blocks && Object.keys(section.blocks).length > 0;
            const isExpanded = expandedSections.has(sectionKey);
            
            if (!section || !sectionDefinition) {
              return null;
            }

            // Use existing block keys if block_order is undefined
            const blockOrder = section.block_order || (section.blocks ? Object.keys(section.blocks) : []);

            return (
              <div
                key={sectionKey}
                className={`${styles.section} ${isSelected ? styles.selected : ''}`}
              >
                <div className={styles.sectionHeader} onClick={() => handleSectionClick(sectionKey)}>
                  <InlineStack align="space-between" blockAlign="center" gap="200" wrap={false}>
                    <InlineStack gap="200" blockAlign="center" wrap={false}>
                      <div className={styles.sectionDragHandle}>
                        <Icon source={DragHandleIcon} />
                      </div>
                      <div className={styles.sectionContent}>
                        <Text as="p" variant="bodyMd" fontWeight="semibold">{sectionDefinition.name}</Text>
                      </div>
                    </InlineStack>
                    <ButtonGroup>
                      <Button
                        icon={DeleteIcon}
                        variant="plain"
                        tone="critical"
                        onClick={() => onDeleteSection(sectionKey)}
                      />
                    </ButtonGroup>
                  </InlineStack>
                </div>
                {hasBlocks && isExpanded && (
                  <div className={styles.sectionBlocks}>
                    {section.blocks && (
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId={`blocks-${sectionKey}`}>
                          {(provided: DroppableProvided) => (
                            <div 
                              className={styles.blockList}
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {blockOrder.map((blockKey, index) => {
                                const block = section.blocks?.[blockKey];
                                const blockDefinition = sectionDefinition.schema?.blocks?.find(
                                  (b) => b.type === block?.type
                                );

                                if (!block || !blockDefinition) {
                                  return null;
                                }

                                return (
                                  <Draggable 
                                    key={blockKey} 
                                    draggableId={blockKey} 
                                    index={index}
                                  >
                                    {(provided: DraggableProvided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={styles.block}
                                        onClick={() => selectBlock(blockKey)}
                                      >
                                        <InlineStack align="space-between" blockAlign="center" gap="200">
                                          <InlineStack gap="200" blockAlign="center">
                                            <div 
                                              className={styles.blockDragHandle}
                                              {...provided.dragHandleProps}
                                            >
                                              <Icon source={DragHandleIcon} />
                                            </div>
                                            <Text as="span" variant="bodySm">
                                              {blockDefinition.name}
                                            </Text>
                                          </InlineStack>
                                          <ButtonGroup>
                                            <Button
                                              icon={DeleteIcon}
                                              variant="plain"
                                              tone="critical"
                                              onClick={() => deleteBlock(sectionKey, blockKey)}
                                              accessibilityLabel={`Delete ${blockDefinition.name} block`}
                                            />
                                          </ButtonGroup>
                                        </InlineStack>
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    )}
                    <BlockTemplateSelector
                      active={showBlockTemplates === sectionKey}
                      activator={
                        <Button 
                          onClick={() => setShowBlockTemplates(sectionKey)}
                          variant="plain"
                          fullWidth
                        >
                          Add Block
                        </Button>
                      }
                      onClose={() => setShowBlockTemplates(null)}
                      sectionKey={sectionKey}
                      sectionType={section.type}
                    />
                  </div>
                )}
              </div>
            );
          })}
          <SectionTemplateSelector
            active={showSectionTemplates}
            activator={
              <Button fullWidth onClick={() => setShowSectionTemplates(true)}>
                Add Section
              </Button>
            }
            onClose={() => setShowSectionTemplates(false)}
          />
        </div>
      </BlockStack>
    </div>
  );
}); 