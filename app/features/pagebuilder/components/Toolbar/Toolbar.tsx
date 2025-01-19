import React, { memo, useCallback, useState } from 'react';
import { ButtonGroup, Button, Text, InlineStack } from '@shopify/polaris';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import { AIModal } from '../AIModal/AIModal.js';
import { generatePage } from '../../services/ai.js';
import type { Section } from '../../types.js';
import { v4 as uuidv4 } from 'uuid';
import styles from './Toolbar.module.css';

interface AIGeneratedSection {
  type: Section['type'];
  settings: Section['settings'];
}

interface AIGeneratedPage {
  type: string;
  sections: AIGeneratedSection[];
  settings?: Record<string, any>;
}

interface AIGeneratedResponse {
  page: AIGeneratedPage;
}

export const Toolbar = memo(function Toolbar() {
  const {
    page,
    selectedSectionId,
    selectedBlockId,
    savePage,
    publishPage,
    isLoading,
    updatePageSettings,
    updatePageContent
  } = usePageBuilder();
  const [showAIModal, setShowAIModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePreview = useCallback(() => {
    // Open preview in new tab
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write('<h1>Page Preview</h1><pre>' + JSON.stringify(page, null, 2) + '</pre>');
    }
  }, [page]);

  const handleGenerateWithAI = useCallback(async (prompt: string) => {
    try {
      const response = await generatePage(prompt);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate page');
      }
      
      // Cast the response data to our expected type
      const aiResponse = response.data as unknown as AIGeneratedResponse;
      
      // Transform the AI response data into the expected format
      const sections: Record<string, Section> = {};
      const sectionOrder: string[] = [];

      // Handle the case where response.data.page.sections is an array
      if (Array.isArray(aiResponse.page?.sections)) {
        aiResponse.page.sections.forEach((section) => {
          const sectionId = uuidv4();
          // Cast the section to the appropriate type
          sections[sectionId] = {
            id: sectionId,
            type: section.type,
            settings: section.settings,
            blocks: {},
            block_order: []
          } as unknown as Section; // Safe cast since we know the structure matches
          sectionOrder.push(sectionId);
        });
      }

      // Update page content with transformed data
      updatePageContent(sections, sectionOrder);

      // Update page settings if they exist
      if (aiResponse.page?.settings) {
        updatePageSettings({
          ...aiResponse.page.settings,
          seo: {
            title: page.settings.seo.title,
            description: page.settings.seo.description,
            url_handle: page.settings.seo.url_handle
          }
        });
      }
    } catch (error) {
      console.error('Error generating page:', error);
      throw error;
    }
  }, [updatePageSettings, updatePageContent, page.settings.seo]);

  return (
    <div className={styles.toolbar}>
      <InlineStack align="space-between">
        <Text variant="headingLg" as="h1">{page.title}</Text>
        <ButtonGroup>
          <Button onClick={() => setShowAIModal(true)}>
            Generate with AI
          </Button>
          <Button onClick={handlePreview}>
            Preview
          </Button>
        </ButtonGroup>
      </InlineStack>

      <InlineStack align="space-between">
        <ButtonGroup>
          <Button
            onClick={savePage}
            loading={isSaving}
          >
            Save
          </Button>
          <Button
            variant="primary"
            onClick={publishPage}
            disabled={isSaving}
          >
            Publish
          </Button>
        </ButtonGroup>
      </InlineStack>

      <AIModal
        open={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGenerate={handleGenerateWithAI}
        title="Generate Page with AI"
        description="Describe the page you want to create and our AI will generate it for you. You can include details about the layout, content, and style."
        placeholder="Example: Create a landing page for a summer sale with a hero section, featured products, and a newsletter signup form."
        generateButtonText="Generate Page"
      />
    </div>
  );
}); 