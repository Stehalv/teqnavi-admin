import React, { useCallback, useState, useEffect } from 'react';
import { Card, Button, ButtonGroup, Text, BlockStack, InlineStack, Modal, TextField } from '@shopify/polaris';
import type { EditorProps } from '@monaco-editor/react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import styles from './CSSEditor.module.css';

interface CSSEditorProps {
  sectionKey: string;
  sectionType: string;
  initialValue?: string;
}

// Helper function to scope CSS selectors to a specific section
function scopeCSS(css: string, sectionKey: string): string {
  // Split the CSS into individual rules
  return css.replace(/([^}]+)(})/g, (_, rules, closing) => {
    // Split multiple selectors and scope each one
    const selectors = rules.split('{')[0].split(',');
    const scopedSelectors = selectors.map((selector: string) => 
      selector.trim().startsWith('@media') 
        ? selector // Don't scope media queries
        : `[data-section-id="${sectionKey}"] ${selector.trim()}`
    );
    
    // Rejoin the selectors with the rules
    return `${scopedSelectors.join(',')}${rules.includes('{') ? rules.split('{')[1] : rules}${closing}`;
  });
}

export function CSSEditor({ sectionKey, sectionType, initialValue = '' }: CSSEditorProps) {
  const { updateSectionStyles, optimizeCSS, page } = usePageBuilder();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth / 4, y: window.innerHeight / 4 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [editorValue, setEditorValue] = useState('');
  const [optimizePrompt, setOptimizePrompt] = useState('');

  // Initialize editor value from section styles or initial value
  useEffect(() => {
    const sectionStyles = page.data.sections[sectionKey]?.styles;
    setEditorValue(sectionStyles || initialValue);
  }, [sectionKey, initialValue, page.data.sections]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setEditorValue(value);
      const scopedValue = scopeCSS(value, sectionKey);
      updateSectionStyles(sectionKey, scopedValue);
    }
  }, [sectionKey, updateSectionStyles]);

  const handleOptimize = useCallback(async () => {
    try {
      console.log('Starting CSS optimization for:', { 
        sectionKey, 
        sectionType, 
        prompt: optimizePrompt,
        currentCSS: editorValue 
      });

      // If we have a prompt and existing CSS, always optimize the current CSS
      // Otherwise, if no CSS exists, generate new CSS
      const currentCSS = optimizePrompt && editorValue ? editorValue : undefined;
      
      await optimizeCSS(sectionKey, sectionType, optimizePrompt, currentCSS);
      
      // Update editor value with the new optimized CSS
      const section = page.data.sections[sectionKey];
      if (section?.styles) {
        setEditorValue(section.styles);
        console.log('Updated editor value:', section.styles);
      }
      
      console.log('CSS optimization completed');
    } catch (error) {
      console.error('Failed to optimize CSS:', error);
      // TODO: Add error toast or notification
    }
  }, [sectionKey, sectionType, optimizeCSS, optimizePrompt, page?.data?.sections, editorValue]);

  useEffect(() => {
    console.log('Editor value updated:', editorValue);
  }, [editorValue]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.closest('.monaco-editor')) {
      return;
    }
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Edit CSS</Button>

      {isOpen && (
        <div 
          className={styles.modalOverlay}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div 
            className={styles.draggableModal}
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            <div 
              className={styles.modalHeader}
              onMouseDown={handleMouseDown}
            >
              <div className={styles.headerContent}>
                <Text as="h3" variant="headingMd">CSS Editor</Text>
                <Text as="span" variant="bodySm" tone="subdued">
                  Section: {sectionType} ({sectionKey})
                </Text>
              </div>
              <div className={styles.headerActions}>
                <TextField
                  label=""
                  placeholder="Enter optimization prompt..."
                  value={optimizePrompt}
                  onChange={setOptimizePrompt}
                  autoComplete="off"
                  labelHidden
                />
                <ButtonGroup>
                  <Button onClick={handleOptimize} variant="primary">
                    {editorValue ? 'Optimize CSS' : 'Generate CSS'}
                  </Button>
                  <Button onClick={() => setIsOpen(false)} variant="plain">Close</Button>
                </ButtonGroup>
              </div>
            </div>
            
            <div className={styles.editorContainer}>
              <Text as="p" variant="bodySm" tone="subdued" alignment="start">
                All selectors will be automatically scoped to this section.
              </Text>
              <div style={{ marginTop: 'var(--p-space-200)' }}>
                <MonacoEditor
                  height="500px"
                  defaultLanguage="css"
                  value={editorValue}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                    tabSize: 2,
                    padding: { top: 16, bottom: 16 },
                    renderLineHighlight: 'all',
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                      verticalScrollbarSize: 12,
                      horizontalScrollbarSize: 12
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 