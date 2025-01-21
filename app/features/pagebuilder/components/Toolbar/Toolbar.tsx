import React, { memo, useCallback, useState } from 'react';
import { ButtonGroup, Button, Text } from '@shopify/polaris';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import type { Section } from '../../types/shopify.js';
import styles from './Toolbar.module.css';

export const Toolbar = memo(function Toolbar() {
  const {
    page,
    savePage,
    publishPage,
    isLoading,
  } = usePageBuilder();
  const [isSaving, setIsSaving] = useState(false);

  const handlePreview = useCallback(() => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write('<h1>Page Preview</h1><pre>' + JSON.stringify(page, null, 2) + '</pre>');
    }
  }, [page]);

  return (
    <nav className={styles.toolbar}>
      <Text variant="headingMd" as="h1">{page.title}</Text>
      <ButtonGroup>
        <Button
          onClick={handlePreview}
          disabled={isLoading || isSaving}
        >
          Preview
        </Button>
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
    </nav>
  );
}); 