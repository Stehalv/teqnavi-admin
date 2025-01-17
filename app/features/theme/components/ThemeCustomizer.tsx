import { BlockStack, Box, Button, InlineStack, Text, Popover } from "@shopify/polaris";
import { DragHandleIcon, DeleteIcon, ChevronUpIcon, ChevronDownIcon, SettingsIcon, PlusIcon } from "@shopify/polaris-icons";
import { BlockSettings } from "./BlockSettings.js";
import { SectionSettings } from "./SectionSettings.js";
import { useState } from "react";
import type { ThemeAsset, Block, Section } from "../types.js";
import type { MouseEvent } from "react";

interface SectionEditorProps {
  section: Section;
  sectionAsset: ThemeAsset;
  onChange: (sectionId: string, key: string, value: any) => void;
}

interface BlockEditorProps {
  block: Block;
  blockAsset: ThemeAsset;
  onChange: (sectionId: string, blockId: string, key: string, value: any) => void;
}

const renderSectionEditor = ({ section, sectionAsset, onChange }: SectionEditorProps) => {
  console.log('Rendering section editor with:', {
    sectionId: section.id,
    sectionType: section.type,
    sectionSettings: section.settings,
    sectionAssetContent: sectionAsset?.content?.substring(0, 100) + '...'
  });
  return (
    <SectionSettings
      section={section}
      sectionAsset={sectionAsset}
      onChange={(updatedSection) => {
        console.log('Section settings changed:', updatedSection);
        if (updatedSection.settings) {
          Object.entries(updatedSection.settings).forEach(([key, value]) => {
            onChange(section.id, key, value);
          });
        }
      }}
    />
  );
};

const renderBlockEditor = ({ block, blockAsset, onChange }: BlockEditorProps) => {
  console.log('Rendering block editor with:', {
    blockId: block.id,
    blockType: block.type,
    blockSettings: block.settings,
    blockAssetContent: blockAsset?.content?.substring(0, 100) + '...'
  });
  return (
    <BlockSettings
      block={block}
      blockAsset={blockAsset}
      onChange={(updatedBlock) => {
        console.log('Block settings changed:', updatedBlock);
        if (updatedBlock.settings) {
          Object.entries(updatedBlock.settings).forEach(([key, value]) => {
            onChange(block.id, block.id, key, value);
          });
        }
      }}
    />
  );
};

interface ThemeCustomizerProps {
  sections: Section[];
  blocks: Block[];
  assets: ThemeAsset[];
  onSectionSettingsChange: (sectionId: string, key: string, value: any) => void;
  onBlockSettingsChange: (sectionId: string, blockId: string, key: string, value: any) => void;
}

export function ThemeCustomizer({
  sections = [],
  blocks = [],
  assets = [],
  onSectionSettingsChange,
  onBlockSettingsChange
}: ThemeCustomizerProps) {
  console.log('ThemeCustomizer received:', {
    sections: sections.map(s => ({ id: s.id, type: s.type })),
    blocks: blocks.map(b => ({ id: b.id, type: b.type })),
    assets: assets.map(a => ({ id: a.id, type: a.type }))
  });

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'section' | 'block' | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const handleSettingsClick = (itemId: string, type: 'section' | 'block') => {
    console.log('Settings clicked:', { itemId, type });
    setSelectedItemId(itemId);
    setSelectedItemType(type);
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
    setSelectedItemId(null);
    setSelectedItemType(null);
  };

  const toggleCollapse = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const renderSettings = () => {
    console.log('Rendering settings for:', { selectedItemId, selectedItemType });
    if (!selectedItemId || !selectedItemType) return null;

    if (selectedItemType === 'section') {
      const section = sections.find(s => s.id === selectedItemId);
      const sectionAsset = assets.find(a => a.type === section?.type);
      console.log('Found section and asset:', { 
        section: section ? { id: section.id, type: section.type } : null,
        sectionAsset: sectionAsset ? { id: sectionAsset.id, type: sectionAsset.type } : null 
      });
      if (!section || !sectionAsset) return null;

      return renderSectionEditor({
        section,
        sectionAsset,
        onChange: onSectionSettingsChange
      });
    }

    if (selectedItemType === 'block') {
      const block = blocks.find(b => b.id === selectedItemId);
      const blockAsset = assets.find(a => a.type === block?.type);
      console.log('Found block and asset:', {
        block: block ? { id: block.id, type: block.type } : null,
        blockAsset: blockAsset ? { id: blockAsset.id, type: blockAsset.type } : null
      });
      if (!block || !blockAsset) return null;

      return renderBlockEditor({
        block,
        blockAsset,
        onChange: onBlockSettingsChange
      });
    }
  };

  if (!Array.isArray(sections) || !Array.isArray(blocks) || !Array.isArray(assets)) {
    console.log('Invalid arrays received:', { 
      sectionsIsArray: Array.isArray(sections),
      blocksIsArray: Array.isArray(blocks),
      assetsIsArray: Array.isArray(assets)
    });
    return null;
  }

  return (
    <div>
      {sections.map((section) => {
        const isCollapsed = collapsedSections.has(section.id);
        const sectionBlocks = blocks.filter(block => block.sectionId === section.id);

        return (
          <Box key={section.id} padding="400" background="bg-surface">
            <BlockStack gap="400">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '8px',
                background: 'var(--p-surface-selected)',
                borderRadius: '4px'
              }}>
                <Button variant="plain" icon={DragHandleIcon} />
                <div style={{ flex: 1 }}>
                  <Text as="h2" variant="headingMd">{section.type}</Text>
                </div>
                <InlineStack gap="200" align="end">
                  <Button
                    icon={SettingsIcon}
                    onClick={() => handleSettingsClick(section.id, 'section')}
                    variant="plain"
                  />
                  <Button
                    icon={DeleteIcon}
                    variant="plain"
                    tone="critical"
                  />
                  <Button
                    icon={isCollapsed ? ChevronDownIcon : ChevronUpIcon}
                    onClick={() => toggleCollapse(section.id)}
                    variant="plain"
                  />
                </InlineStack>
              </div>

              {!isCollapsed && (
                <div style={{ paddingLeft: '24px' }}>
                  {selectedItemId === section.id && (
                    <Box padding="400">
                      {renderSettings()}
                    </Box>
                  )}
                  
                  <BlockStack gap="300">
                    {sectionBlocks.map((block) => (
                      <div
                        key={block.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          background: 'var(--p-surface-subdued)',
                          borderRadius: '4px',
                          marginLeft: '16px'
                        }}
                      >
                        <Button variant="plain" icon={DragHandleIcon} />
                        <div style={{ flex: 1 }}>
                          <Text as="p" variant="bodyMd">{block.type}</Text>
                        </div>
                        <InlineStack gap="200" align="end">
                          <Button
                            icon={SettingsIcon}
                            onClick={() => handleSettingsClick(block.id, 'block')}
                            variant="plain"
                          />
                          <Button
                            icon={DeleteIcon}
                            variant="plain"
                            tone="critical"
                          />
                        </InlineStack>
                      </div>
                    ))}
                    
                    <div style={{ marginLeft: '16px' }}>
                      <Button variant="plain" icon={PlusIcon}>
                        Add block
                      </Button>
                    </div>
                  </BlockStack>
                </div>
              )}
            </BlockStack>
          </Box>
        );
      })}
    </div>
  );
}