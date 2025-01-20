import React, { memo } from 'react';
import type { PageUI, SectionUI } from '../../types/shopify.js';
import { SectionRenderer } from '../SectionRenderer/SectionRenderer.js';
import styles from './PreviewPane.module.css';

interface PreviewPaneProps {
  page: PageUI;
  selectedSectionId?: string;
  selectedBlockId?: string;
}

export const PreviewPane = memo(function PreviewPane({
  page,
  selectedSectionId,
  selectedBlockId
}: PreviewPaneProps) {
  if (!page?.data?.order) {
    return null;
  }

  return (
    <div className={styles.previewPane}>
      {page.data.order.map((sectionId: string) => {
        const section = page.data.sections[sectionId];
        if (!section) return null;
        
        return (
          <div
            key={sectionId}
            className={`${styles.sectionWrapper} ${selectedSectionId === sectionId ? styles.selectedSection : ''}`}
          >
            <SectionRenderer
              section={section}
              isSelected={selectedSectionId === sectionId}
              selectedBlockId={selectedBlockId}
            />
          </div>
        );
      })}
    </div>
  );
}); 