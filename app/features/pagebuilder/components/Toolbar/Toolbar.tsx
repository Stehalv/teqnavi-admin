import React, { memo, useCallback, useState } from 'react';
import { ButtonGroup, Button, Text, InlineStack, Modal, TextField, TextContainer } from '@shopify/polaris';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import type { Section, Block, ShopifyPageJSON } from '../../types/shopify.js';
import styles from './Toolbar.module.css';
import { useFetcher } from '@remix-run/react';

interface GenerateResponse {
  sections: Record<string, Section>;
  order: string[];
  settings?: {
    seo?: {
      title?: string;
      description?: string;
      url_handle?: string;
    };
  };
}

export const Toolbar = memo(function Toolbar() {
  const {
    page,
    selectedSectionKey,
    selectedBlockKey,
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
    const { sections, order, settings } = fetcher.data;
    
    // Update page content with generated sections
    updatePageContent(sections, order);

    // Update page settings if provided
    if (settings) {
      updatePageSettings(settings);
    }
  }

  return (
    <div className={styles.toolbar}>
      <InlineStack gap="300" align="space-between" blockAlign="center">
        <ButtonGroup>
          <Button
            onClick={() => setShowAIModal(true)}
            disabled={isLoading || isSaving}
          >
            Generate with AI
          </Button>
          <Button
            onClick={handlePreview}
            disabled={isLoading || isSaving}
          >
            Preview
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button
            onClick={savePage}
            disabled={isLoading || isSaving}
          >
            Save
          </Button>
          <Button
            variant="primary"
            onClick={publishPage}
            disabled={isLoading || isSaving}
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
          content: 'Generate',
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
            <Text as="p">
              Describe what kind of page you want to create and I'll help you generate it.
            </Text>
            <TextField
              label="Page Description"
              value={prompt}
              onChange={setPrompt}
              multiline={4}
              autoComplete="off"
              placeholder="Example: Create a landing page for a new product launch with a hero section, feature highlights, and a call to action."
            />
          </TextContainer>
        </Modal.Section>
      </Modal>
    </div>
  );
}); 