import React, { memo, useState } from 'react';
import { Text, Button, Icon, BlockStack, ButtonGroup, InlineStack } from '@shopify/polaris';
import { DragHandleIcon, DeleteIcon } from '@shopify/polaris-icons';
import type { PageUI, Block } from '../../types/shopify.js';
import { isSectionWithBlocks } from '../../types/shopify.js';
import { SectionTemplateSelector } from '../SectionTemplateSelector/SectionTemplateSelector.js';
import { BlockTemplateSelector } from '../BlockTemplateSelector/BlockTemplateSelector.js';
import styles from './SectionList.module.css';

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
            const isSelected = selectedSectionKey === sectionKey;
            const hasBlocks = isSectionWithBlocks(section);
            
            return (
              <div
                key={sectionKey}
                className={`${styles.section} ${isSelected ? styles.selected : ''}`}
              >
                <div className={styles.sectionHeader} onClick={() => onSelectSection(sectionKey)}>
                  <InlineStack align="space-between" blockAlign="center" gap="200" wrap={false}>
                    <InlineStack gap="200" blockAlign="center" wrap={false}>
                      <div className={styles.sectionDragHandle}>
                        <Icon source={DragHandleIcon} />
                      </div>
                      <div className={styles.sectionContent}>
                        <Text as="p" variant="bodyMd">{section.type}</Text>
                        {hasBlocks && section.block_order && section.block_order.length > 0 && (
                          <Text as="p" variant="bodySm" tone="subdued">
                            {section.block_order.length} blocks
                          </Text>
                        )}
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
                {isSelected && hasBlocks && (
                  <div className={styles.sectionBlocks}>
                    {section.block_order && section.block_order.length > 0 && (
                      <div className={styles.blockList}>
                        {section.block_order.map((blockKey) => {
                          const block = section.blocks?.[blockKey];
                          if (!block) return null;
                          return (
                            <div key={blockKey} className={styles.block}>
                              <Text as="p" variant="bodySm">{block.type}</Text>
                            </div>
                          );
                        })}
                      </div>
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