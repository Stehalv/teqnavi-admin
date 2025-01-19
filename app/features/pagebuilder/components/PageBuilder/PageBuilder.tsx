import React, { useCallback } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, closestCenter, DragOverlay } from '@dnd-kit/core';
import { Frame, Loading, Banner, Page } from '@shopify/polaris';
import { usePageBuilder } from '../../context/PageBuilderContext.js';
import { Toolbar } from '../Toolbar/Toolbar.js';
import { SectionList } from '../SectionList/SectionList.js';
import { SettingsPanel } from '../SettingsPanel/SettingsPanel.js';
import { PreviewPane } from '~/features/pagebuilder/components/PreviewPane/PreviewPane.js';
import { Section } from '../Section/Section.js';
import { Block } from '../Block/Block.js';
import styles from './PageBuilder.module.css';

export function PageBuilder() {
  const { 
    page,
    selectedSectionId,
    selectedBlockId,
    isDragging,
    dragItem,
    isLoading,
    error,
    startDrag,
    endDrag,
    dismissError
  } = usePageBuilder();

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    startDrag({
      id: active.id as string,
      type: active.data.current?.type || 'SECTION',
      index: active.data.current?.sortable.index,
      parentId: active.data.current?.parentId
    });
  }, [startDrag]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      endDrag({
        id: active.id as string,
        type: active.data.current?.type || 'SECTION',
        index: over.data.current?.sortable.index,
        parentId: active.data.current?.parentId
      });
    }
  }, [endDrag]);

  const renderDragOverlay = useCallback(() => {
    if (!dragItem) return null;

    if (dragItem.type === 'SECTION' && dragItem.id) {
      const section = page.sections[dragItem.id];
      if (section) {
        return (
          <div className={styles.dragOverlay}>
            <Section
              section={section}
              isSelected={false}
              isDragging={true}
            />
          </div>
        );
      }
    }

    if (dragItem.type === 'BLOCK' && dragItem.parentId && dragItem.id) {
      const section = page.sections[dragItem.parentId];
      const block = section?.blocks[dragItem.id];
      if (block) {
        return (
          <div className={styles.dragOverlay}>
            <Block
              block={block}
              isSelected={false}
              parentId={dragItem.parentId}
            />
          </div>
        );
      }
    }

    return null;
  }, [dragItem, page.sections]);

  return (
    <Page fullWidth>
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
              <SectionList />
            </div>
            
            <div className={styles.main}>
              <PreviewPane
                page={page}
                selectedSectionId={selectedSectionId}
                selectedBlockId={selectedBlockId}
              />
            </div>
            
            <div className={styles.settings}>
              <SettingsPanel />
            </div>
          </div>

          <DragOverlay>
            {isDragging && renderDragOverlay()}
          </DragOverlay>
        </DndContext>
      </div>
    </Page>
  );
} 