import React, { memo, useEffect, useState } from 'react';
import { Card, Text, Button, BlockStack, Icon, Spinner, InlineStack } from '@shopify/polaris';
import { ImageIcon, ProductIcon } from '@shopify/polaris-icons';
import type { Section, Block } from '../../types/shopify.js';
import styles from './SectionRenderer.module.css';

interface SectionRendererProps {
  section: Section;
  sectionKey: string;
  isSelected: boolean;
  selectedBlockKey?: string;
}

export const SectionRenderer = memo(function SectionRenderer({
  section,
  sectionKey,
  isSelected,
  selectedBlockKey
}: SectionRendererProps) {
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function renderSection() {
      try {
        setError(null);
        
        const response = await fetch(`/api/render-section`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            section,
            sectionKey
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to render section' }));
          throw new Error(errorData.error || 'Failed to render section');
        }

        const html = await response.text();
        setRenderedHtml(html || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render section');
        console.error('Error rendering section:', err);
        setRenderedHtml('');
      } finally {
        setIsInitialLoad(false);
      }
    }

    renderSection();
  }, [section, sectionKey]);

  if (isInitialLoad) {
    return (
      <Card>
        <InlineStack align="center" gap="400">
          <Spinner size="small" />
          <Text as="span">Loading section...</Text>
        </InlineStack>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Text as="p" tone="critical">Error: {error}</Text>
      </Card>
    );
  }

  return (
    <div 
      className={`${styles.section} ${isSelected ? styles.selected : ''}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}); 