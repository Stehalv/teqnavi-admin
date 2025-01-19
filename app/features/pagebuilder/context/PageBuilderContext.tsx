import React, { createContext, useContext, useCallback } from 'react';
import { useImmer } from 'use-immer';
import { v4 as uuidv4 } from 'uuid';
import type { 
  Page, 
  Section, 
  Block, 
  SectionType, 
  BlockType,
  DragItem,
  DropResult
} from '../types.js';

interface PageBuilderState {
  page: Page;
  selectedSectionId?: string;
  selectedBlockId?: string;
  isDragging: boolean;
  dragItem?: DragItem;
  isLoading: boolean;
  error?: string;
}

interface PageBuilderContextType extends PageBuilderState {
  // Section Operations
  addSection: (type: SectionType) => void;
  deleteSection: (sectionId: string) => void;
  updateSectionSettings: <T extends Section>(sectionId: string, settings: Partial<T['settings']>) => void;
  reorderSections: (newOrder: string[]) => void;
  
  // Block Operations
  addBlock: (sectionId: string, type: BlockType) => void;
  deleteBlock: (sectionId: string, blockId: string) => void;
  updateBlockSettings: <T extends Block>(sectionId: string, blockId: string, settings: Partial<T['settings']>) => void;
  reorderBlocks: (sectionId: string, newOrder: string[]) => void;
  
  // Selection Operations
  selectSection: (sectionId?: string) => void;
  selectBlock: (blockId?: string) => void;
  
  // Drag and Drop Operations
  startDrag: (item: DragItem) => void;
  endDrag: (result: DropResult) => void;
  
  // Page Operations
  updatePageSettings: (settings: Partial<Page['settings']>) => void;
  updatePageContent: (sections: Record<string, Section>, sectionOrder: string[]) => void;
  savePage: () => Promise<void>;
  publishPage: () => Promise<void>;
  dismissError: () => void;
}

interface PageBuilderProviderProps {
  children: React.ReactNode;
  initialPage: Page;
  onSave: (page: Page) => Promise<void>;
  onPublish?: (page: Page) => Promise<void>;
}

const PageBuilderContext = createContext<PageBuilderContextType | null>(null);

export function PageBuilderProvider({ 
  children, 
  initialPage,
  onSave,
  onPublish
}: PageBuilderProviderProps) {
  const [state, updateState] = useImmer<PageBuilderState>({
    page: initialPage,
    selectedSectionId: undefined,
    selectedBlockId: undefined,
    isDragging: false,
    isLoading: false
  });

  // Section Operations
  const addSection = useCallback((type: SectionType) => {
    updateState(draft => {
      const newSection: Section = {
        id: uuidv4(),
        type,
        blocks: {},
        block_order: [],
        settings: getDefaultSectionSettings(type)
      } as Section;

      draft.page.sections[newSection.id] = newSection;
      draft.page.section_order.push(newSection.id);
      draft.selectedSectionId = newSection.id;
      draft.selectedBlockId = undefined;
    });
  }, []);

  const deleteSection = useCallback((sectionId: string) => {
    updateState(draft => {
      const { [sectionId]: _, ...remainingSections } = draft.page.sections;
      draft.page.sections = remainingSections;
      draft.page.section_order = draft.page.section_order.filter(id => id !== sectionId);
      
      if (draft.selectedSectionId === sectionId) {
        draft.selectedSectionId = undefined;
        draft.selectedBlockId = undefined;
      }
    });
  }, []);

  const updateSectionSettings = useCallback(<T extends Section>(
    sectionId: string, 
    settings: Partial<T['settings']>
  ) => {
    updateState(draft => {
      const section = draft.page.sections[sectionId];
      if (section) {
        Object.assign(section.settings, settings);
      }
    });
  }, []);

  const reorderSections = useCallback((newOrder: string[]) => {
    updateState(draft => {
      draft.page.section_order = newOrder;
    });
  }, []);

  // Block Operations
  const addBlock = useCallback((sectionId: string, type: BlockType) => {
    updateState(draft => {
      const section = draft.page.sections[sectionId];
      if (section) {
        const newBlock: Block = {
          id: uuidv4(),
          type,
          settings: getDefaultBlockSettings(type)
        } as Block;

        section.blocks[newBlock.id] = newBlock;
        section.block_order.push(newBlock.id);
        draft.selectedBlockId = newBlock.id;
      }
    });
  }, []);

  const deleteBlock = useCallback((sectionId: string, blockId: string) => {
    updateState(draft => {
      const section = draft.page.sections[sectionId];
      if (section) {
        const { [blockId]: _, ...remainingBlocks } = section.blocks;
        section.blocks = remainingBlocks;
        section.block_order = section.block_order.filter(id => id !== blockId);

        if (draft.selectedBlockId === blockId) {
          draft.selectedBlockId = undefined;
        }
      }
    });
  }, []);

  const updateBlockSettings = useCallback(<T extends Block>(
    sectionId: string, 
    blockId: string, 
    settings: Partial<T['settings']>
  ) => {
    updateState(draft => {
      const section = draft.page.sections[sectionId];
      if (section) {
        const block = section.blocks[blockId];
        if (block) {
          Object.assign(block.settings, settings);
        }
      }
    });
  }, []);

  const reorderBlocks = useCallback((sectionId: string, newOrder: string[]) => {
    updateState(draft => {
      const section = draft.page.sections[sectionId];
      if (section) {
        section.block_order = newOrder;
      }
    });
  }, []);

  // Selection Operations
  const selectSection = useCallback((sectionId?: string) => {
    updateState(draft => {
      draft.selectedSectionId = sectionId;
      draft.selectedBlockId = undefined;
    });
  }, []);

  const selectBlock = useCallback((blockId?: string) => {
    updateState(draft => {
      draft.selectedBlockId = blockId;
    });
  }, []);

  // Drag and Drop Operations
  const startDrag = useCallback((item: DragItem) => {
    updateState(draft => {
      draft.isDragging = true;
      draft.dragItem = item;
    });
  }, []);

  const endDrag = useCallback((result: DropResult) => {
    updateState(draft => {
      draft.isDragging = false;
      draft.dragItem = undefined;

      if (result.type === 'SECTION') {
        draft.page.section_order = reorderArray(
          draft.page.section_order,
          result.id,
          result.index
        );
      } else if (result.type === 'BLOCK' && result.parentId) {
        const section = draft.page.sections[result.parentId];
        if (section) {
          section.block_order = reorderArray(
            section.block_order,
            result.id,
            result.index
          );
        }
      }
    });
  }, []);

  // Page Operations
  const updatePageSettings = useCallback((settings: Partial<Page['settings']>) => {
    updateState(draft => {
      Object.assign(draft.page.settings, settings);
    });
  }, []);

  const updatePageContent = useCallback((sections: Record<string, Section>, sectionOrder: string[]) => {
    updateState(draft => {
      draft.page.sections = sections;
      draft.page.section_order = sectionOrder;
    });
  }, []);

  const savePage = useCallback(async () => {
    if (!onSave) return;

    updateState(draft => {
      draft.isLoading = true;
      draft.error = undefined;
    });

    try {
      await onSave(state.page);
      updateState(draft => {
        draft.isLoading = false;
      });
    } catch (error) {
      updateState(draft => {
        draft.isLoading = false;
        draft.error = error instanceof Error ? error.message : 'Failed to save page';
      });
    }
  }, [onSave, state.page]);

  const publishPage = useCallback(async () => {
    if (!onPublish) return;

    updateState(draft => {
      draft.isLoading = true;
      draft.error = undefined;
    });

    try {
      await onPublish(state.page);
      updateState(draft => {
        draft.isLoading = false;
        draft.page.isPublished = true;
        draft.page.publishedAt = new Date();
      });
    } catch (error) {
      updateState(draft => {
        draft.isLoading = false;
        draft.error = error instanceof Error ? error.message : 'Failed to publish page';
      });
    }
  }, [onPublish, state.page]);

  const dismissError = useCallback(() => {
    updateState(draft => {
      draft.error = undefined;
    });
  }, []);

  const value: PageBuilderContextType = {
    ...state,
    addSection,
    deleteSection,
    updateSectionSettings,
    reorderSections,
    addBlock,
    deleteBlock,
    updateBlockSettings,
    reorderBlocks,
    selectSection,
    selectBlock,
    startDrag,
    endDrag,
    updatePageSettings,
    updatePageContent,
    savePage,
    publishPage,
    dismissError
  };

  return (
    <PageBuilderContext.Provider value={value}>
      {children}
    </PageBuilderContext.Provider>
  );
}

export function usePageBuilder() {
  const context = useContext(PageBuilderContext);
  if (!context) {
    throw new Error('usePageBuilder must be used within a PageBuilderProvider');
  }
  return context;
}

// Helper Functions
function getDefaultSectionSettings(type: SectionType): Section['settings'] {
  switch (type) {
    case 'hero':
      return {
        heading: 'Welcome to our store',
        subheading: 'Shop the latest trends',
        background_type: 'color',
        background_value: '#000000',
        text_color: '#ffffff',
        text_alignment: 'center',
        content_width: 'medium',
        min_height: 400,
        overlay_opacity: 0
      };
    case 'featured-collection':
      return {
        title: 'Featured Collection',
        collection_id: '',
        products_to_show: 4,
        columns_desktop: 4,
        columns_mobile: 2,
        show_view_all: true,
        view_all_style: 'button',
        enable_quick_add: true,
        show_secondary_image: true,
        show_vendor: true,
        show_rating: true,
        enable_filtering: false,
        enable_sorting: false
      };
    case 'rich-text':
      return {
        content: 'Add your content here',
        text_alignment: 'left',
        narrow_content: true,
        enable_custom_text_color: false,
        background_type: 'none'
      };
    case 'image-with-text':
      return {
        image: '',
        image_width: 'medium',
        image_aspect_ratio: '16/9',
        heading: 'Image with text',
        text: 'Pair text with an image',
        layout: 'image_first',
        desktop_content_position: 'middle',
        desktop_content_alignment: 'left',
        enable_custom_text_color: false
      };
    case 'newsletter':
      return {
        heading: 'Subscribe to our newsletter',
        background_type: 'none',
        content_alignment: 'center',
        narrow_content: true,
        show_social_sharing: true,
        enable_name_field: true,
        success_message: 'Thanks for subscribing!'
      };
  }
}

function getDefaultBlockSettings(type: BlockType): Block['settings'] {
  switch (type) {
    case 'text':
      return {
        text: 'Add your text here',
        alignment: 'left',
        size: 'medium',
        font_family: 'system',
        font_weight: 'normal'
      };
    case 'image':
      return {
        image: '',
        alt: '',
        overlay_opacity: 0,
        aspect_ratio: '16/9',
        lazy_load: true
      };
    case 'button':
      return {
        text: 'Click me',
        link: '',
        style: 'primary',
        size: 'medium',
        full_width: false,
        open_in_new_tab: false
      };
    case 'product':
      return {
        product_id: '',
        show_price: true,
        show_vendor: true,
        show_rating: true,
        show_badges: true,
        enable_quick_add: true,
        image_aspect_ratio: '1/1'
      };
  }
}

function reorderArray<T>(array: T[], itemId: T, newIndex: number): T[] {
  const oldIndex = array.indexOf(itemId);
  if (oldIndex === -1) return array;

  const newArray = [...array];
  newArray.splice(oldIndex, 1);
  newArray.splice(newIndex, 0, itemId);
  return newArray;
} 