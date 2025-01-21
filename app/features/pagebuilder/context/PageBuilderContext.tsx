import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useImmer } from 'use-immer';
import { v4 as uuidv4 } from 'uuid';
import type { 
  PageUI,
  Section,
  Block,
  DragItemType,
  DragItem,
  DropResult
} from '../types/shopify.js';
import type { SectionRegistry } from '../types/templates.js';

interface PageBuilderState {
  page: PageUI;
  selectedSectionKey?: string;
  selectedBlockKey?: string;
  isDragging: boolean;
  dragItem?: DragItem;
  isLoading: boolean;
  error?: string;
}

interface PageBuilderContextType extends PageBuilderState {
  // Section Operations
  addSection: (type: string, settings?: Record<string, any>) => void;
  deleteSection: (sectionKey: string) => void;
  updateSectionSettings: (sectionKey: string, settings: Partial<Section['settings']>) => void;
  reorderSections: (newOrder: string[]) => void;
  
  // Block Operations
  addBlock: (sectionKey: string, type: string) => void;
  deleteBlock: (sectionKey: string, blockKey: string) => void;
  updateBlockSettings: (sectionKey: string, blockKey: string, settings: Partial<Block['settings']>) => void;
  reorderBlocks: (sectionKey: string, newOrder: string[]) => void;
  
  // Selection Operations
  selectSection: (sectionKey?: string) => void;
  selectBlock: (blockKey?: string) => void;
  
  // Drag and Drop Operations
  startDrag: (item: DragItem) => void;
  endDrag: (result: DropResult) => void;
  
  // Page Operations
  updatePage: (updates: Partial<PageUI>) => void;
  updatePageContent: (sections: Record<string, Section>, order: string[]) => void;
  updatePageSettings: (settings: Record<string, any>) => void;
  savePage: () => Promise<void>;
  publishPage: () => Promise<void>;
  dismissError: () => void;
  
  // CSS Operations
  updateSectionStyles: (sectionKey: string, styles: string) => void;
  optimizeCSS: (sectionKey: string, sectionType: string, prompt?: string, currentCSS?: string) => Promise<void>;

  // Registry
  sectionRegistry: SectionRegistry;
}

interface PageBuilderProviderProps {
  children: React.ReactNode;
  initialPage: PageUI;
  sectionRegistry: SectionRegistry;
  onSave: (page: PageUI) => Promise<void>;
  onPublish?: (page: PageUI) => Promise<void>;
}

const PageBuilderContext = createContext<PageBuilderContextType | null>(null);

export function PageBuilderProvider({ 
  children, 
  initialPage,
  sectionRegistry,
  onSave,
  onPublish
}: PageBuilderProviderProps) {
  const [state, updateState] = useImmer<PageBuilderState>({
    page: initialPage,
    selectedSectionKey: undefined,
    selectedBlockKey: undefined,
    isDragging: false,
    isLoading: false
  });

  // Section Operations
  const addSection = useCallback((type: string, settings?: Record<string, any>) => {
    updateState(draft => {
      const sectionKey = `section-${type}-${uuidv4()}`;
      const sectionDefinition = sectionRegistry[type];
      
      if (sectionDefinition) {
        // Initialize settings with defaults from schema
        const initialSettings: Record<string, any> = {};
        sectionDefinition.schema.settings.forEach(field => {
          if (field.default !== undefined) {
            initialSettings[field.id] = field.default;
          }
        });
        
        // Add section with settings (provided settings override defaults)
        draft.page.data.sections[sectionKey] = {
          type,
          settings: { ...initialSettings, ...settings },
          blocks: {},
          block_order: []
        };
        draft.page.data.order.push(sectionKey);
        draft.selectedSectionKey = sectionKey;
        draft.selectedBlockKey = undefined;
      }
    });
  }, [sectionRegistry]);

  const deleteSection = useCallback((sectionKey: string) => {
    updateState(draft => {
      delete draft.page.data.sections[sectionKey];
      draft.page.data.order = draft.page.data.order.filter(key => key !== sectionKey);
      
      if (draft.selectedSectionKey === sectionKey) {
        draft.selectedSectionKey = undefined;
        draft.selectedBlockKey = undefined;
      }
    });
  }, []);

  const updateSectionSettings = useCallback((
    sectionKey: string, 
    settings: Partial<Section['settings']>
  ) => {
    console.log('Before update:', {
      sectionKey,
      newSettings: settings,
      currentSettings: state.page.data.sections[sectionKey]?.settings
    });

    updateState(draft => {
      const section = draft.page.data.sections[sectionKey];
      if (section) {
        // Create a new settings object with the current settings
        const updatedSettings = { ...section.settings };
        
        // Update only the changed keys
        Object.keys(settings).forEach(key => {
          updatedSettings[key] = settings[key];
        });
        
        // Set the updated settings
        section.settings = updatedSettings;
      }
    });

    console.log('After update:', {
      updatedSettings: state.page.data.sections[sectionKey]?.settings
    });
  }, [state.page.data.sections]);

  const reorderSections = useCallback((newOrder: string[]) => {
    updateState(draft => {
      draft.page.data.order = newOrder;
    });
  }, []);

  // Block Operations
  const addBlock = useCallback((sectionKey: string, type: string) => {
    updateState(draft => {
      const section = draft.page.data.sections[sectionKey];
      if (section) {
        const blockKey = `block-${uuidv4()}`;
        const sectionDefinition = sectionRegistry[section.type];
        const blockDefinition = sectionDefinition?.blocks?.[type];

        if (blockDefinition) {
          section.blocks[blockKey] = {
            type,
            settings: {}
          };
          section.block_order.push(blockKey);
          draft.selectedBlockKey = blockKey;
        }
      }
    });
  }, [sectionRegistry]);

  const deleteBlock = useCallback((sectionKey: string, blockKey: string) => {
    updateState(draft => {
      const section = draft.page.data.sections[sectionKey];
      if (section) {
        delete section.blocks[blockKey];
        if (!section.block_order) section.block_order = [];
        section.block_order = section.block_order.filter(key => key !== blockKey);
        if (draft.selectedBlockKey === blockKey) {
          draft.selectedBlockKey = undefined;
        }
      }
    });
  }, []);

  const updateBlockSettings = useCallback((
    sectionKey: string, 
    blockKey: string, 
    settings: Partial<Block['settings']>
  ) => {
    updateState(draft => {
      const section = draft.page.data.sections[sectionKey];
      if (section) {
        if (!section.blocks) section.blocks = {};
        const block = section.blocks[blockKey];
        if (block) {
          Object.assign(block.settings, settings);
        }
      }
    });
  }, []);

  const reorderBlocks = useCallback((sectionKey: string, newOrder: string[]) => {
    updateState(draft => {
      const section = draft.page.data.sections[sectionKey];
      if (section) {
        section.block_order = newOrder;
      }
    });
  }, []);

  // Selection Operations
  const selectSection = useCallback((sectionKey?: string) => {
    updateState(draft => {
      draft.selectedSectionKey = sectionKey;
      draft.selectedBlockKey = undefined;
    });
  }, []);

  const selectBlock = useCallback((blockKey?: string) => {
    updateState(draft => {
      draft.selectedBlockKey = blockKey;
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
          result.key,
          result.index
        );
      } else if (result.type === 'BLOCK' && result.parentKey) {
        const section = draft.page.data.sections[result.parentKey];
        if (section) {
          section.block_order = reorderStrings(
            section.block_order ?? [],
            result.key,
            result.index
          );
        }
      }
    });
  }, []);

  // Page Operations
  const updatePage = useCallback((updates: Partial<PageUI>) => {
    updateState(draft => {
      Object.assign(draft.page, updates);
    });
  }, []);

  const updatePageContent = useCallback((sections: Record<string, Section>, order: string[]) => {
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

  const updateSectionStyles = useCallback((sectionKey: string, styles: string) => {
    updateState(draft => {
      const section = draft.page.data.sections[sectionKey];
      if (section) {
        section.styles = styles;
      }
    });
  }, []);

  const optimizeCSS = useCallback(async (sectionKey: string, sectionType: string, prompt?: string, currentCSS?: string) => {
    try {
      console.log('Sending optimize request:', {
        sectionKey,
        sectionType,
        currentCSS: currentCSS || state.page.data.sections[sectionKey]?.styles,
        settings: state.page.data.sections[sectionKey]?.settings,
        prompt
      });

      const response = await fetch('/api/pagebuilder/optimize-css', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey,
          sectionType,
          css: currentCSS || state.page.data.sections[sectionKey]?.styles,
          settings: state.page.data.sections[sectionKey]?.settings,
          prompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to optimize CSS');
      }
      
      const data = await response.json();
      console.log('Received optimized CSS:', data);
      
      if (!data.optimizedCSS) {
        throw new Error('No CSS received from optimization');
      }

      updateSectionStyles(sectionKey, data.optimizedCSS);
    } catch (error) {
      console.error('Error optimizing CSS:', error);
      throw error;
    }
  }, [state.page.data.sections]);

  const contextValue = useMemo<PageBuilderContextType>(() => ({
    ...state,
    sectionRegistry,
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
    updatePage,
    updatePageContent,
    updatePageSettings,
    savePage,
    publishPage,
    dismissError,
    updateSectionStyles,
    optimizeCSS
  }), [
    state,
    sectionRegistry,
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
    updatePage,
    updatePageContent,
    updatePageSettings,
    savePage,
    publishPage,
    dismissError,
    updateSectionStyles,
    optimizeCSS
  ]);

  return (
    <PageBuilderContext.Provider value={contextValue}>
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
function reorderStrings(array: string[], itemKey: string, newIndex: number): string[] {
  const currentIndex = array.indexOf(itemKey);
  if (currentIndex === -1) return array;

  const newArray = [...array];
  newArray.splice(currentIndex, 1);
  newArray.splice(newIndex, 0, itemKey);
  return newArray;
} 