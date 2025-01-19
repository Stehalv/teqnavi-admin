import React, { memo, useCallback, useState } from 'react';
import { Card, BlockStack, Button, Text, Box, InlineStack } from '@shopify/polaris';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Section } from '../Section/Section.js';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import { SectionType } from '../../types.js';
import { AIModal } from '../AIModal/AIModal.js';
import { generateSection } from '../../services/ai.js';
import styles from './SectionList.module.css';

export const SectionList = memo(function SectionList() {
  const {
    page,
    selectedSectionId,
    selectedBlockId,
    isDragging,
    addSection
  } = usePageBuilder();
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedSectionType, setSelectedSectionType] = useState<SectionType | null>(null);

  const handleAddSection = useCallback((type: SectionType) => {
    setSelectedSectionType(type);
    setShowAIModal(true);
  }, []);

  const handleGenerateSection = useCallback(async (prompt: string) => {
    if (!selectedSectionType) return;

    try {
      const response = await generateSection(prompt, selectedSectionType);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate section');
      }
      
      addSection(response.data.type);
    } catch (error) {
      console.error('Error generating section:', error);
      throw error;
    }
  }, [selectedSectionType, addSection]);

  return (
    <>
      <Card>
        <BlockStack gap="400">
          <Box padding="400" borderBlockEndWidth="025">
            <Text variant="headingMd" as="h2">Page Sections</Text>
          </Box>

          <div className={styles.sectionList}>
            <SortableContext
              items={page.section_order}
              strategy={verticalListSortingStrategy}
            >
              {page.section_order.map((sectionId) => (
                <Section
                  key={sectionId}
                  section={page.sections[sectionId]}
                  isSelected={selectedSectionId === sectionId}
                  selectedBlockId={selectedBlockId}
                  isDragging={isDragging}
                />
              ))}
            </SortableContext>
          </div>

          <Box padding="400">
            <BlockStack gap="200">
              <Text variant="headingSm" as="h3">Add Section</Text>
              <InlineStack gap="200" wrap>
                <Button onClick={() => handleAddSection('hero')}>Hero</Button>
                <Button onClick={() => handleAddSection('featured-collection')}>Collection</Button>
                <Button onClick={() => handleAddSection('rich-text')}>Rich Text</Button>
                <Button onClick={() => handleAddSection('image-with-text')}>Image with Text</Button>
                <Button onClick={() => handleAddSection('newsletter')}>Newsletter</Button>
              </InlineStack>
            </BlockStack>
          </Box>
        </BlockStack>
      </Card>

      <AIModal
        open={showAIModal}
        onClose={() => {
          setShowAIModal(false);
          setSelectedSectionType(null);
        }}
        onGenerate={handleGenerateSection}
        title={`Generate ${selectedSectionType?.replace('-', ' ')} Section`}
        description="Describe the section you want to create and our AI will generate it for you. You can include details about the content, layout, and style."
        placeholder={`Example: Create a ${selectedSectionType?.replace('-', ' ')} section that...`}
        generateButtonText="Generate Section"
      />
    </>
  );
}); 