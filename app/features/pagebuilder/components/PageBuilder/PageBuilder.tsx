import React, { useCallback } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, closestCenter, DragOverlay } from '@dnd-kit/core';
import { Frame, Loading, Banner, Page as PolarisPage } from '@shopify/polaris';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import { Toolbar } from '../Toolbar/Toolbar.js';
import { SectionList } from '../SectionList/SectionList.js';
import { SettingsPanel } from '../SettingsPanel/SettingsPanel.js';
import { PreviewPane } from '../PreviewPane/PreviewPane.js';
import { Section } from '../Section/Section.js';
import { Block } from '../Block/Block.js';
import styles from './PageBuilder.module.css';
import type { PageUI, DragItemType, Section as SectionType, Block as BlockType } from '../../types/shopify.js';

export function PageBuilder() {
  const { 
    page,
    selectedSectionKey,
    selectedBlockKey,
    isDragging,
    dragItem,
    isLoading,
    error,
    startDrag,
    endDrag,
    dismissError,
    selectSection,
    deleteSection
  } = usePageBuilder();

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    startDrag({
      key: active.id as string,
      type: (active.data.current?.type || 'SECTION') as DragItemType,
      index: active.data.current?.sortable?.index,
      parentKey: active.data.current?.parentKey
    });
  }, [startDrag]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      endDrag({
        key: active.id as string,
        type: (active.data.current?.type || 'SECTION') as DragItemType,
        index: over.data.current?.sortable?.index || 0,
        parentKey: active.data.current?.parentKey
      });
    }
  }, [endDrag]);

  const renderDragOverlay = useCallback(() => {
    if (!dragItem) return null;

    if (dragItem.type === 'SECTION' && dragItem.key) {
      const section = page.data.sections[dragItem.key];
      if (section) {
        return (
          <div className={styles.dragOverlay}>
            <Section
              section={section}
              sectionKey={dragItem.key}
              isSelected={false}
              isDragging={true}
            />
          </div>
        );
      }
    }

    if (dragItem.type === 'BLOCK' && dragItem.parentKey && dragItem.key) {
      const section = page.data.sections[dragItem.parentKey];
      const block = section?.blocks?.[dragItem.key];
      if (block) {
        return (
          <div className={styles.dragOverlay}>
            <Block
              block={block}
              blockKey={dragItem.key}
              parentKey={dragItem.parentKey}
              isSelected={false}
            />
          </div>
        );
      }
    }

    return null;
  }, [dragItem, page]);

  if (!page) {
    return (
      <PolarisPage fullWidth>
        <Loading />
      </PolarisPage>
    );
  }

  return (
    <PolarisPage fullWidth>
      {isLoading && <Loading />}
      
      {error && (
        <Banner
          title="Error"
          tone="critical"
          onDismiss={dismissError}
        >
          <p>{error}</p>
        </Banner>
      )}

      <div className={styles.root}>
        <Toolbar />
        
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.content}>
            <div className={styles.sidebar}>
              <SectionList
                page={page}
                selectedSectionKey={selectedSectionKey}
                onSelectSection={selectSection}
                onDeleteSection={deleteSection}
              />
            </div>
            
            <div className={styles.main}>
              <PreviewPane
                page={page}
                selectedSectionKey={selectedSectionKey}
                selectedBlockKey={selectedBlockKey}
              />
            </div>
            
            <div className={styles.settings}>
              <SettingsPanel
                selectedSectionKey={selectedSectionKey || null}
                section={selectedSectionKey ? page.data.sections[selectedSectionKey] : null}
              />
            </div>
          </div>

          <DragOverlay>
            {isDragging && renderDragOverlay()}
          </DragOverlay>
        </DndContext>
      </div>
    </PolarisPage>
  );
} 