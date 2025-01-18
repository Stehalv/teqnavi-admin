import { useState, useCallback, useMemo } from "react";
import { BlockStack, Box, Card } from "@shopify/polaris";
import { AssetPickerPopover } from "./AssetPickerPopover.js";
import { usePickerState } from "../hooks/usePickerState.js";
import { useAssets } from "../hooks/useAssets.js";
import { SettingsEditor } from "./SettingsEditor.js";
import { ItemHeader } from "./ItemHeader.js";
import type { SettingSchema, SettingValue, ProcessedAsset } from "../types.js";

interface Block {
  type?: string;
  name?: string;
  settings: Record<string, any>;
  source?: string;
}

interface Section {
  type: string;
  settings: Record<string, any>;
  blocks?: {
    [key: string]: Block;
  };
}

interface PageContent {
  sections: {
    [key: string]: Section;
  };
  order: string[];
}

interface SectionListProps {
  content: string;
  onContentChange: (newContent: string) => void;
  shopId: string;
}

interface SettingsEditorState {
  isOpen: boolean;
  type: 'section' | 'block';
  sectionId?: string;
  blockId?: string;
}

export function SectionList({ content, onContentChange, shopId }: SectionListProps) {
  const [settingsEditor, setSettingsEditor] = useState<SettingsEditorState | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const { isPickerOpen, openPicker, closePicker } = usePickerState();
  const { sections: fileAssets, blocks: blockAssets, assetsMap } = useAssets({ shopId });
  
  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  // Parse page content with validation
  const pageContent = useMemo(() => {
    try {
      const parsed = JSON.parse(content);
      return {
        sections: parsed?.sections || {},
        order: Array.isArray(parsed?.order) ? parsed.order : []
      };
    } catch (error) {
      console.error('Failed to parse page content:', error);
      return { sections: {}, order: [] };
    }
  }, [content]);

  const handlePickerSelect = useCallback((item: ProcessedAsset) => {
    const newContent = { ...pageContent };
    const sectionId = `section-${Date.now()}`;

    // Add new section with default settings from schema
    newContent.sections[sectionId] = {
      type: item.type,
      settings: {},  // Start with empty settings, defaults will come from schema
      blocks: {}
    };
    newContent.order.push(sectionId);

    onContentChange(JSON.stringify(newContent, null, 2));
    closePicker();
  }, [pageContent, onContentChange, closePicker]);

  const handleSettingsClick = useCallback((sectionId: string, blockId?: string) => {
    setSettingsEditor(prev => {
      // If clicking the same section/block that's already open, close it
      if (prev?.sectionId === sectionId && prev?.blockId === blockId) {
        return null;
      }
      // Otherwise, open settings for the clicked section/block
      return {
        isOpen: true,
        type: blockId ? 'block' : 'section',
        sectionId,
        blockId
      };
    });
  }, []);

  const handleSettingsChange = useCallback((values: SettingValue[]) => {
    if (!settingsEditor) return;

    const newContent = { ...pageContent };
    const newSettings = values.reduce((acc, { id, value }) => {
      acc[id] = value;
      return acc;
    }, {} as Record<string, any>);

    if (settingsEditor.blockId) {
      newContent.sections[settingsEditor.sectionId].blocks[settingsEditor.blockId].settings = newSettings;
    } else {
      newContent.sections[settingsEditor.sectionId].settings = newSettings;
    }

    onContentChange(JSON.stringify(newContent, null, 2));
  }, [pageContent, onContentChange, settingsEditor]);

  // Get current settings schema and values for the active section/block
  const { currentSchema, currentValues } = useMemo(() => {
    if (!settingsEditor) return { currentSchema: [], currentValues: [] };

    const currentSection = pageContent.sections[settingsEditor.sectionId];
    if (!currentSection) return { currentSchema: [], currentValues: [] };

    if (settingsEditor.blockId) {
      // Get block settings
      const block = currentSection.blocks?.[settingsEditor.blockId];
      if (!block) return { currentSchema: [], currentValues: [] };

      // Find the block asset and its schema using id
      const blockAsset = assetsMap[block.type];
      if (!blockAsset?.settings?.schema) return { currentSchema: [], currentValues: [] };

      const schema = blockAsset.settings.schema;
      return {
        currentSchema: schema,
        currentValues: schema.map(setting => ({
          id: setting.id,
          value: block.settings?.[setting.id] ?? setting.default
        }))
      };
    } else {
      // Get section settings using id
      const sectionAsset = assetsMap[currentSection.type];
      if (!sectionAsset?.settings?.schema) return { currentSchema: [], currentValues: [] };

      const schema = sectionAsset.settings.schema;
      return {
        currentSchema: schema,
        currentValues: schema.map(setting => ({
          id: setting.id,
          value: currentSection.settings?.[setting.id] ?? setting.default
        }))
      };
    }
  }, [settingsEditor, pageContent, assetsMap]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    const newContent = { ...pageContent };
    const orderIndex = newContent.order.indexOf(sectionId);
    if (orderIndex > -1) {
      newContent.order.splice(orderIndex, 1);
    }
    delete newContent.sections[sectionId];
    onContentChange(JSON.stringify(newContent, null, 2));
  }, [pageContent, onContentChange]);

  const handleDeleteBlock = useCallback((sectionId: string, blockId: string) => {
    const newContent = { ...pageContent };
    delete newContent.sections[sectionId].blocks[blockId];
    onContentChange(JSON.stringify(newContent, null, 2));
  }, [pageContent, onContentChange]);

  return (
    <BlockStack gap="400">
      {pageContent.order.map((sectionId) => {
        const section = pageContent.sections[sectionId];
        const isCollapsed = collapsedSections.has(sectionId);
        
        return (
          <Card key={sectionId}>
            <ItemHeader
              type={section.type}
              isSection
              isCollapsed={isCollapsed}
              onSettingsClick={() => handleSettingsClick(sectionId)}
              onDelete={() => handleDeleteSection(sectionId)}
              onToggleCollapse={() => toggleSection(sectionId)}
            />

            {settingsEditor && settingsEditor.sectionId === sectionId && !settingsEditor.blockId && (
              <Box padding="400" borderBlockEndWidth="025" borderColor="border">
                {(() => {
                  console.log('Section Settings Props:', {
                    currentSchema,
                    currentValues,
                    sectionType: section.type,
                    asset: assetsMap[section.type]
                  });
                  return null;
                })()}
                <SettingsEditor
                  settings={currentSchema}
                  values={currentValues}
                  onChange={handleSettingsChange}
                />
              </Box>
            )}

            {!isCollapsed && (
              <Box padding="400">
                <BlockStack gap="300">
                  {section.blocks && Object.entries(section.blocks).map(([blockId, block]: [string, Block]) => (
                    <div key={blockId}>
                      <ItemHeader
                        type={block.type || block.name}
                        onSettingsClick={() => handleSettingsClick(sectionId, blockId)}
                        onDelete={() => handleDeleteBlock(sectionId, blockId)}
                      />
                      {settingsEditor && 
                       settingsEditor.sectionId === sectionId && 
                       settingsEditor.blockId === blockId && (
                        <div style={{ 
                          padding: 'var(--p-space-400)',
                          background: 'var(--p-surface-subdued)',
                          borderRadius: 'var(--p-border-radius-200)'
                        }}>
                          <SettingsEditor
                            settings={currentSchema}
                            values={currentValues}
                            onChange={handleSettingsChange}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  <Box>
                    <AssetPickerPopover
                      mode="block"
                      assets={blockAssets}
                      buttonText="Add block"
                      isOpen={isPickerOpen('block', sectionId)}
                      onClose={closePicker}
                      onSelect={(item: ProcessedAsset) => {
                        const newContent = { ...pageContent };
                        const blockId = `block-${Date.now()}`;
                        
                        newContent.sections[sectionId].blocks = newContent.sections[sectionId].blocks || {};
                        newContent.sections[sectionId].blocks[blockId] = {
                          type: item.id,
                          settings: {}, // Start with empty settings, defaults will come from schema
                          source: 'app'
                        };

                        onContentChange(JSON.stringify(newContent, null, 2));
                        closePicker();
                      }}
                      onClick={() => openPicker('block', sectionId)}
                    />
                  </Box>
                </BlockStack>
              </Box>
            )}
          </Card>
        );
      })}

      <Box padding="400">
        <AssetPickerPopover
          mode="section"
          assets={Object.values(assetsMap)}
          buttonText="Add section"
          isOpen={isPickerOpen('section')}
          onClose={closePicker}
          onSelect={handlePickerSelect}
          onClick={() => openPicker('section')}
        />
      </Box>
    </BlockStack>
  );
} 