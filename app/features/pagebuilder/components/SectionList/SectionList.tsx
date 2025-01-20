import React, { memo, useState } from 'react';
import { Text, Button, Icon, BlockStack, ButtonGroup, InlineStack } from '@shopify/polaris';
import { DragHandleIcon, DeleteIcon } from '@shopify/polaris-icons';
import type { PageUI, BlockUI } from '../../types/shopify.js';
import { SectionTemplateSelector } from '../SectionTemplateSelector/SectionTemplateSelector.js';
import { BlockTemplateSelector } from '../BlockTemplateSelector/BlockTemplateSelector.js';
import styles from './SectionList.module.css';

interface SectionListProps {
  page: PageUI;
  selectedSectionId?: string;
  onSelectSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
}

export const SectionList = memo(function SectionList({
  page,
  selectedSectionId,
  onSelectSection,
  onDeleteSection
}: SectionListProps) {
  const [showSectionTemplates, setShowSectionTemplates] = useState(false);
  const [showBlockTemplates, setShowBlockTemplates] = useState<string | null>(null);

  const supportsBlocks = (sectionId: string) => {
    const section = page.data.sections[sectionId];
    const template = page.templates[section.type];
    return template?.blocks && template.blocks.length > 0;
  };

  return (
    <div className={styles.sectionList}>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">Sections</Text>
        <div className={styles.sections}>
          {page.data.order.map((sectionId: string) => {
            const section = page.data.sections[sectionId];
            const isSelected = selectedSectionId === sectionId;
            const hasBlockSupport = supportsBlocks(sectionId);
            
            return (
              <div
                key={sectionId}
                className={`${styles.section} ${isSelected ? styles.selected : ''}`}
              >
                <div className={styles.sectionHeader} onClick={() => onSelectSection(sectionId)}>
                  <InlineStack align="space-between" blockAlign="center" gap="200" wrap={false}>
                    <InlineStack gap="200" blockAlign="center" wrap={false}>
                      <div className={styles.sectionDragHandle}>
                        <Icon source={DragHandleIcon} />
                      </div>
                      <div className={styles.sectionContent}>
                        <Text as="p" variant="bodyMd">{section.type}</Text>
                        {hasBlockSupport && (
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
                        onClick={() => onDeleteSection(sectionId)}
                      />
                    </ButtonGroup>
                  </InlineStack>
                </div>
                {isSelected && hasBlockSupport && (
                  <div className={styles.sectionBlocks}>
                    {section.block_order.length > 0 && (
                      <div className={styles.blockList}>
                        {section.block_order.map((blockId) => {
                          const block = section.blocks[blockId] as BlockUI;
                          return (
                            <div key={blockId} className={styles.block}>
                              <Text as="p" variant="bodySm">{block.type}</Text>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <BlockTemplateSelector
                      active={showBlockTemplates === sectionId}
                      activator={
                        <Button 
                          onClick={function() { setShowBlockTemplates(sectionId); }}
                          variant="plain"
                          fullWidth
                        >
                          Add Block
                        </Button>
                      }
                      onClose={() => setShowBlockTemplates(null)}
                      sectionId={sectionId}
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