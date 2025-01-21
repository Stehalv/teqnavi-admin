import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Tabs, Button, Spinner, Text } from '@shopify/polaris';
import { CodeEditor } from '../CodeEditor/CodeEditor.js';
import cssStyles from './TemplateEditorModal.module.css';

interface TemplateEditorModalProps {
  open: boolean;
  onClose: () => void;
  sectionType: string;
  initialTab?: 'schema' | 'liquid' | 'styles';
}

export function TemplateEditorModal({ 
  open, 
  onClose, 
  sectionType,
  initialTab = 'schema' 
}: TemplateEditorModalProps) {
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [schema, setSchema] = useState('');
  const [liquid, setLiquid] = useState('');
  const [styles, setStyles] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load template data when modal opens
  useEffect(() => {
    if (open) {
      const loadTemplate = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/templates/${sectionType}`);
          if (!response.ok) {
            throw new Error('Failed to load template');
          }
          const data = await response.json();
          setSchema(JSON.stringify(data.schema, null, 2));
          setLiquid(data.liquid || '');
          setStyles(data.styles || '');
        } catch (error) {
          console.error('Error loading template:', error);
          setError(error instanceof Error ? error.message : 'Failed to load template');
        } finally {
          setIsLoading(false);
        }
      };

      loadTemplate();
    }
  }, [open, sectionType]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/templates/${sectionType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schema: JSON.parse(schema),
          liquid,
          styles,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      setError(error instanceof Error ? error.message : 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  }, [schema, liquid, styles, sectionType, onClose]);

  const tabs = [
    {
      id: 'schema',
      content: 'Schema',
      accessibilityLabel: 'Schema',
      panelID: 'schema-panel',
    },
    {
      id: 'liquid',
      content: 'Liquid',
      accessibilityLabel: 'Liquid',
      panelID: 'liquid-panel',
    },
    {
      id: 'styles',
      content: 'Styles',
      accessibilityLabel: 'Styles',
      panelID: 'styles-panel',
    },
  ];

  const renderEditor = () => {
    if (isLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Spinner size="large" />
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ padding: '1rem', color: 'rgb(216, 44, 13)' }}>
          <Text as="p">{error}</Text>
        </div>
      );
    }

    switch (selectedTab) {
      case 'schema':
        return (
          <CodeEditor
            value={schema}
            onChange={setSchema}
            language="json"
            height="100%"
          />
        );
      case 'liquid':
        return (
          <CodeEditor
            value={liquid}
            onChange={setLiquid}
            language="liquid"
            height="100%"
          />
        );
      case 'styles':
        return (
          <CodeEditor
            value={styles}
            onChange={setStyles}
            language="css"
            height="100%"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit ${sectionType} Template`}
      primaryAction={{
        content: 'Save',
        onAction: handleSave,
        loading: isSaving,
        disabled: isLoading || !!error
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose
        }
      ]}
    >
      <Modal.Section>
        <div className={cssStyles.modalContent}>
          <div className={cssStyles.editorContainer}>
            <Tabs
              tabs={tabs}
              selected={tabs.findIndex(tab => tab.id === selectedTab)}
              onSelect={(index) => setSelectedTab(tabs[index].id as 'schema' | 'liquid' | 'styles')}
            />
            <div className={cssStyles.editorContent}>
              {renderEditor()}
            </div>
          </div>
        </div>
      </Modal.Section>
    </Modal>
  );
} 