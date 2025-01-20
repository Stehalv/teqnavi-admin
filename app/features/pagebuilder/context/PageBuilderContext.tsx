import React, { createContext, useContext, useCallback } from 'react';
import { useImmer } from 'use-immer';
import { v4 as uuidv4 } from 'uuid';
import type { 
  PageUI,
  SectionUI, 
  BlockUI, 
  DragItemType,
  DragItem,
  DropResult
} from '../types/shopify.js';

interface PageBuilderState {
  page: PageUI;
  selectedSectionId?: string;
  selectedBlockId?: string;
  isDragging: boolean;
  dragItem?: DragItem;
  isLoading: boolean;
  error?: string;
}

interface PageBuilderContextType extends PageBuilderState {
  // Section Operations
  addSection: (section: SectionUI) => void;
  deleteSection: (sectionId: string) => void;
  updateSectionSettings: (sectionId: string, settings: Partial<SectionUI['settings']>) => void;
  reorderSections: (newOrder: string[]) => void;
  
  // Block Operations
  addBlock: (sectionId: string, type: string) => void;
  deleteBlock: (sectionId: string, blockId: string) => void;
  updateBlockSettings: (sectionId: string, blockId: string, settings: Partial<BlockUI['settings']>) => void;
  reorderBlocks: (sectionId: string, newOrder: string[]) => void;
  
  // Selection Operations
  selectSection: (sectionId?: string) => void;
  selectBlock: (blockId?: string) => void;
  
  // Drag and Drop Operations
  startDrag: (item: DragItem) => void;
  endDrag: (result: DropResult) => void;
  
  // Page Operations
  updatePageContent: (sections: Record<string, SectionUI>, order: string[]) => void;
  updatePageSettings: (settings: Record<string, any>) => void;
  savePage: () => Promise<void>;
  publishPage: () => Promise<void>;
  dismissError: () => void;
}

interface PageBuilderProviderProps {
  children: React.ReactNode;
  initialPage: PageUI;
  onSave: (page: PageUI) => Promise<void>;
  onPublish?: (page: PageUI) => Promise<void>;
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
  const addSection = useCallback((section: SectionUI) => {
    updateState(draft => {
      draft.page.data.sections[section.id] = section;
      draft.page.data.order.push(section.id);
      draft.selectedSectionId = section.id;
      draft.selectedBlockId = undefined;
    });
  }, []);

  const deleteSection = useCallback((sectionId: string) => {
    updateState(draft => {
      delete draft.page.data.sections[sectionId];
      draft.page.data.order = draft.page.data.order.filter(id => id !== sectionId);
      
      if (draft.selectedSectionId === sectionId) {
        draft.selectedSectionId = undefined;
        draft.selectedBlockId = undefined;
      }
    });
  }, []);

  const updateSectionSettings = useCallback((
    sectionId: string, 
    settings: Partial<SectionUI['settings']>
  ) => {
    updateState(draft => {
      const section = draft.page.data.sections[sectionId];
      if (section) {
        Object.assign(section.settings, settings);
      }
    });
  }, []);

  const reorderSections = useCallback((newOrder: string[]) => {
    updateState(draft => {
      draft.page.data.order = newOrder;
    });
  }, []);

  // Block Operations
  const addBlock = useCallback((sectionId: string, type: string) => {
    updateState(draft => {
      const section = draft.page.data.sections[sectionId];
      if (section) {
        const blockId = uuidv4();
        section.blocks[blockId] = {
          type,
          settings: getDefaultBlockSettings(type)
        };
        section.block_order.push(blockId);
        draft.selectedBlockId = blockId;
      }
    });
  }, []);

  const deleteBlock = useCallback((sectionId: string, blockId: string) => {
    updateState(draft => {
      const section = draft.page.data.sections[sectionId];
      if (section) {
        delete section.blocks[blockId];
        section.block_order = section.block_order.filter(id => id !== blockId);
        if (draft.selectedBlockId === blockId) {
          draft.selectedBlockId = undefined;
        }
      }
    });
  }, []);

  const updateBlockSettings = useCallback((
    sectionId: string, 
    blockId: string, 
    settings: Partial<BlockUI['settings']>
  ) => {
    updateState(draft => {
      const section = draft.page.data.sections[sectionId];
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
      const section = draft.page.data.sections[sectionId];
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
        draft.page.data.order = reorderStrings(
          draft.page.data.order,
          result.id,
          result.index
        );
      } else if (result.type === 'BLOCK' && result.parentId) {
        const section = draft.page.data.sections[result.parentId];
        if (section) {
          section.block_order = reorderStrings(
            section.block_order,
            result.id,
            result.index
          );
        }
      }
    });
  }, []);

  // Page Operations
  const updatePageContent = useCallback((sections: Record<string, SectionUI>, order: string[]) => {
    updateState(draft => {
      draft.page.data.sections = sections;
      draft.page.data.order = order;
    });
  }, []);

  const updatePageSettings = useCallback((settings: Record<string, any>) => {
    updateState(draft => {
      Object.assign(draft.page.settings, settings);
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
    updatePageContent,
    updatePageSettings,
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
function getDefaultSectionSettings(type: SectionUI['type']): SectionUI['settings'] {
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
    default:
      return {};
  }
}

function getDefaultBlockSettings(type: BlockUI['type']): BlockUI['settings'] {
  switch (type) {
    case 'text':
      return {
        text: 'Add your text here',
        alignment: 'left',
        size: 'medium'
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
        link: '#',
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
    default:
      return {};
  }
}

function reorderStrings(array: string[], itemId: string, newIndex: number): string[] {
  const currentIndex = array.indexOf(itemId);
  if (currentIndex === -1) return array;

  const newArray = [...array];
  newArray.splice(currentIndex, 1);
  newArray.splice(newIndex, 0, itemId);
  return newArray;
} 