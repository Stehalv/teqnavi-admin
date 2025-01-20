import React, { useState, useCallback } from 'react';
import {
  Modal,
  TextField,
  Button,
  BlockStack,
  Text,
  Spinner,
  Banner
} from '@shopify/polaris';
import styles from './AIModal.module.css';

interface AIModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
  title: string;
  description: string;
  placeholder: string;
  generateButtonText: string;
}

export function AIModal({
  open,
  onClose,
  onGenerate,
  title,
  description,
  placeholder,
  generateButtonText = 'Generate'
}: AIModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      await onGenerate(prompt);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, onGenerate, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      primaryAction={{
        content: generateButtonText,
        onAction: handleGenerate,
        loading: isGenerating,
        disabled: !prompt.trim() || isGenerating
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose
        }
      ]}
    >
      <Modal.Section>
        <BlockStack gap="400" align="start">
          <Text as="p">{description}</Text>
          
          {error && (
            <Banner tone="critical" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          )}

          <TextField
            label="Prompt"
            value={prompt}
            onChange={setPrompt}
            placeholder={placeholder}
            multiline={4}
            autoComplete="off"
            disabled={isGenerating}
          />

          {isGenerating && (
            <div className={styles.generating}>
              <Spinner size="small" />
              <Text as="p" variant="bodySm">
                Generating content with AI...
              </Text>
            </div>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
} 