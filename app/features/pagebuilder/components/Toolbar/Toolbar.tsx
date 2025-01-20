import React, { memo, useCallback, useState } from 'react';
import { ButtonGroup, Button, Text, InlineStack, Modal, TextField, TextContainer } from '@shopify/polaris';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import type { Section, Block } from '../../types.js';
import { v4 as uuidv4 } from 'uuid';
import styles from './Toolbar.module.css';
import { useFetcher } from '@remix-run/react';

interface GenerateResponse {
  templates: Array<{
    template: {
      id: string;
    };
    section: {
      type: string;
      settings: Record<string, any>;
      blocks: Array<{
        type: string;
        settings: Record<string, any>;
      }>;
    };
  }>;
  settings?: {
    seo: {
      title: string;
      description: string;
      url_handle: string;
    };
  };
}

function createBlocksWithOrder(blocks: Array<{ type: string; settings: Record<string, any> }>) {
  const blockMap: Record<string, Block> = {};
  const blockOrder: string[] = [];
  
  blocks.forEach(block => {
    const blockId = crypto.randomUUID();
    blockMap[blockId] = {
      id: blockId,
      type: block.type,
      settings: block.settings
    };
    blockOrder.push(blockId);
  });
  
  return { blocks: blockMap, block_order: blockOrder };
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
    updatePageContent,
    addSection,
  } = usePageBuilder();
  const [showAIModal, setShowAIModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fetcher = useFetcher<GenerateResponse>();
  const [prompt, setPrompt] = useState('');

  const handlePreview = useCallback(() => {
    // Open preview in new tab
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write('<h1>Page Preview</h1><pre>' + JSON.stringify(page, null, 2) + '</pre>');
    }
  }, [page]);

  const handleGenerateWithAI = () => {
    fetcher.submit(
      { prompt },
      { 
        method: 'POST',
        action: '/api/pagebuilder/generate',
        encType: 'application/x-www-form-urlencoded'
      }
    );
    setShowAIModal(false);
  };

  // Handle response from AI generation
  if (fetcher.data) {
    const { templates, settings } = fetcher.data;
    
    // Add generated sections
    templates.forEach(({ template, section }) => {
      const { blocks, block_order } = createBlocksWithOrder(section.blocks);
      const newSection: Section = {
        id: crypto.randomUUID(),
        templateId: template.id,
        type: section.type,
        settings: section.settings,
        blocks,
        block_order
      };
      
      addSection(newSection);
    });

    // Update page settings
    if (settings?.seo) {
      updatePageSettings({
        seo: settings.seo
      });
    }
  }

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

      <Modal
        open={showAIModal}
        onClose={() => setShowAIModal(false)}
        title="Generate Page with AI"
        primaryAction={{
          content: 'Generate Page',
          onAction: handleGenerateWithAI,
          loading: fetcher.state === 'submitting'
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setShowAIModal(false)
          }
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>
              Describe the page you want to create and our AI will generate it for you. 
              You can include details about the layout, content, and style.
            </p>
            <p>
              The AI will generate complete sections with:
              - Liquid templates following Shopify best practices
              - Settings schema with appropriate fields
              - Block templates if needed
              - Initial content and settings
            </p>
          </TextContainer>
          <div style={{ marginTop: '16px' }}>
            <TextField
              label="Your page description"
              value={prompt}
              onChange={setPrompt}
              multiline={4}
              autoComplete="off"
              placeholder="Example: Create a landing page for a summer sale with a hero section, featured products, and a newsletter signup form."
              helpText="Be specific about the sections you want and their content. The more details you provide, the better the result."
            />
          </div>
        </Modal.Section>
      </Modal>
    </div>
  );
}); 