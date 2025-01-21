import React, { memo, useCallback, useState } from 'react';
import { Card, ButtonGroup, Button, Text, InlineStack, Spinner } from '@shopify/polaris';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import { Block } from '../Block/Block.js';
import { AIModal } from '../AIModal/AIModal.js';
import type { BlockType, Block as BlockInterface } from '../../types/shopify.js';
import styles from './BlockList.module.css';

const COMMON_BLOCK_TYPES: BlockType[] = ['text', 'image', 'button'];
const SECTION_SPECIFIC_BLOCKS: Record<string, BlockType[]> = {
  'featured-collection': ['product']
};

interface BlockListProps {
  sectionId: string;
  sectionType: string;
  blocks: Record<string, BlockInterface>;
  blockOrder: string[];
  selectedBlockId?: string;
  onBlockSelect?: (blockId: string) => void;
}

export const BlockList = memo(function BlockList({
  sectionId,
  sectionType,
  blocks,
  blockOrder,
  selectedBlockId,
  onBlockSelect
}: BlockListProps) {
  const { addBlock } = usePageBuilder();
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState<BlockType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddBlock = useCallback((type: BlockType) => {
    setSelectedBlockType(type);
    setShowAIModal(true);
  }, []);

  const handleGenerateBlock = useCallback(async (prompt: string) => {
    if (!selectedBlockType) return;
    
    const response = await fetch('/api/ai/generate-section', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: selectedBlockType,
        prompt
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate block');
    }

    const { data } = await response.json();
    // Handle the generated block data
    if (data) {
      // Add the generated block to the section
      addBlock(sectionId, selectedBlockType);
    }
  }, [selectedBlockType, sectionId, addBlock]);

  const availableBlockTypes = [
    ...COMMON_BLOCK_TYPES,
    ...(SECTION_SPECIFIC_BLOCKS[sectionType] || [])
  ];

  return (
    <>
      <Card>
        <div className={styles.blockList}>
          <InlineStack align="space-between">
            <Text variant="headingMd" as="h3">Blocks</Text>
            <ButtonGroup>
              {availableBlockTypes.map(blockType => (
                <Button 
                  key={blockType} 
                  onClick={() => handleAddBlock(blockType)}
                >
                  Add {blockType.charAt(0).toUpperCase() + blockType.slice(1)}
                </Button>
              ))}
            </ButtonGroup>
          </InlineStack>

          {isLoading && (
            <div className={styles.loading}>
              <Spinner size="small" />
              <Text as="p" variant="bodySm">
                Adding block...
              </Text>
            </div>
          )}

          {blockOrder.length === 0 && !isLoading && (
            <div className={styles.empty}>
              <Text as="p" variant="bodySm" tone="subdued">
                No blocks added yet. Add a block or use AI to generate one.
              </Text>
            </div>
          )}

          {blockOrder.map((blockId) => (
            <Block
              key={blockId}
              block={blocks[blockId]}
              blockKey={blockId}
              parentKey={sectionId}
              isSelected={blockId === selectedBlockId}
            />
          ))}
        </div>
      </Card>

      <AIModal
        open={showAIModal}
        onClose={() => {
          setShowAIModal(false);
          setSelectedBlockType(null);
        }}
        onGenerate={handleGenerateBlock}
        title={`Generate ${selectedBlockType} Block`}
        description="Describe the block content you want to create and our AI will generate it for you."
        placeholder={`Example: Create a ${selectedBlockType} block that...`}
        generateButtonText="Generate Block"
      />
    </>
  );
}); 