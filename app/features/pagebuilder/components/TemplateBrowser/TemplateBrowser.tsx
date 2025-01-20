import React, { memo, useCallback, useState } from 'react';
import { Card, ResourceList, ResourceItem, Text, Modal, Banner, InlineStack, ButtonGroup, Button, Spinner, Popover } from '@shopify/polaris';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import type { SectionTemplateWithBlocks } from '../../services/template.server.js';
import type { SectionType } from '../../types.js';
import styles from './TemplateBrowser.module.css';

interface TemplateBrowserProps {
  open: boolean;
  onClose: () => void;
}

export const TemplateBrowser = memo(function TemplateBrowser({ open, onClose }: TemplateBrowserProps) {
  const { addSection } = usePageBuilder();
  const [templates, setTemplates] = useState<SectionTemplateWithBlocks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<SectionTemplateWithBlocks | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to load templates');
      }
      const data = await response.json();
      setTemplates(data.templates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInsert = useCallback(async () => {
    if (!selectedTemplate) return;

    try {
      // Create a new section from the template
      const newSection = {
        id: crypto.randomUUID(),
        templateId: selectedTemplate.id,
        type: selectedTemplate.type as SectionType,
        settings: {},
        blocks: []
      };
      addSection(newSection);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to insert template');
    }
  }, [selectedTemplate, addSection, onClose]);

  const handleDelete = useCallback(async () => {
    if (!selectedTemplate) return;
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/${selectedTemplate.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      // Remove template from list
      setTemplates(prev => prev.filter(t => t.id !== selectedTemplate.id));
      setSelectedTemplate(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedTemplate]);

  // Load templates when modal opens
  React.useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, loadTemplates]);

  const renderPreview = () => {
    if (!selectedTemplate) return null;

    return (
      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Template Preview"
        secondaryActions={[
          {
            content: 'Close',
            onAction: () => setShowPreview(false)
          }
        ]}
      >
        <Modal.Section>
          <div className={styles.preview}>
            <div className={styles.previewHeader}>
              <Text variant="headingMd" as="h3">{selectedTemplate.name}</Text>
              <Text variant="bodySm" as="p" tone="subdued">Type: {selectedTemplate.type}</Text>
            </div>
            <div className={styles.previewContent}>
              <div className={styles.previewSection}>
                <Text variant="headingXs" as="h4">Settings Schema</Text>
                <pre className={styles.previewCode}>
                  {JSON.stringify(selectedTemplate.schema, null, 2)}
                </pre>
              </div>
              {selectedTemplate.blocks.length > 0 && (
                <div className={styles.previewSection}>
                  <Text variant="headingXs" as="h4">Block Templates ({selectedTemplate.blocks.length})</Text>
                  {selectedTemplate.blocks.map(block => (
                    <div key={block.id} className={styles.previewBlock}>
                      <Text variant="bodyMd" as="h5" fontWeight="bold">{block.name}</Text>
                      <Text variant="bodySm" as="p">Type: {block.type}</Text>
                      <pre className={styles.previewCode}>
                        {JSON.stringify(block.schema, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal.Section>
      </Modal>
    );
  };

  const renderDeleteConfirmation = () => {
    if (!selectedTemplate) return null;

    return (
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Template"
        primaryAction={{
          content: 'Delete',
          onAction: handleDelete,
          loading: isDeleting,
          destructive: true
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setShowDeleteConfirm(false)
          }
        ]}
      >
        <Modal.Section>
          <Text as="p">
            Are you sure you want to delete the template "{selectedTemplate.name}"? This action cannot be undone.
          </Text>
        </Modal.Section>
      </Modal>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Insert Template"
      primaryAction={{
        content: 'Insert',
        onAction: handleInsert,
        disabled: !selectedTemplate
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose
        }
      ]}
    >
      <Modal.Section>
        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)}>
            <p>{error}</p>
          </Banner>
        )}

        {isLoading ? (
          <div className={styles.loading}>
            <Spinner accessibilityLabel="Loading templates" size="large" />
          </div>
        ) : (
          <ResourceList
            items={templates}
            renderItem={(template) => (
              <ResourceItem
                id={template.id}
                onClick={() => setSelectedTemplate(template)}
                persistActions
              >
                <InlineStack align="space-between">
                  <div>
                    <Text variant="bodyMd" as="h3" fontWeight="bold">
                      {template.name}
                    </Text>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Type: {template.type}
                    </Text>
                  </div>
                  <ButtonGroup>
                    <Button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}
                      variant="plain"
                    >
                      Preview
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowDeleteConfirm(true);
                      }}
                      tone="critical"
                      variant="plain"
                    >
                      Delete
                    </Button>
                  </ButtonGroup>
                </InlineStack>
              </ResourceItem>
            )}
          />
        )}
      </Modal.Section>

      {renderPreview()}
      {renderDeleteConfirmation()}
    </Modal>
  );
}); 