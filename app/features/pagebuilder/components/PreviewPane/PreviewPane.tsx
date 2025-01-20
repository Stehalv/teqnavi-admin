import React, { memo } from 'react';
import type { PageUI, Section } from '../../types/shopify.js';
import { SectionRenderer } from '../SectionRenderer/SectionRenderer.js';
import styles from './PreviewPane.module.css';

interface PreviewPaneProps {
  page: PageUI;
  selectedSectionKey?: string;
  selectedBlockKey?: string;
}

export const PreviewPane = memo(function PreviewPane({
  page,
  selectedSectionKey,
  selectedBlockKey
}: PreviewPaneProps) {
  if (!page?.data?.order) {
    return null;
  }

  return (
    <div className={styles.previewPane}>
      {page.data.order.map((sectionKey: string) => {
        const section = page.data.sections[sectionKey];
        if (!section) return null;
        
        return (
          <div
            key={sectionKey}
            className={`${styles.sectionWrapper} ${selectedSectionKey === sectionKey ? styles.selectedSection : ''}`}
          >
            <SectionRenderer
              section={section}
              sectionKey={sectionKey}
              isSelected={selectedSectionKey === sectionKey}
              selectedBlockKey={selectedBlockKey}
            />
          </div>
        );
      })}
    </div>
  );
}); 