import { BlockStack, Box, Button, InlineStack, Text, Popover } from "@shopify/polaris";
import { DragHandleIcon, DeleteIcon, ChevronUpIcon, ChevronDownIcon, SettingsIcon } from "@shopify/polaris-icons";
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
  return (
    <SectionSettings
      section={section}
      sectionAsset={sectionAsset}
      onChange={(updatedSection) => {
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
  return (
    <BlockSettings
      block={block}
      blockAsset={blockAsset}
      onChange={(updatedBlock) => {
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
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'section' | 'block' | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsClick = (itemId: string, type: 'section' | 'block') => {
    setSelectedItemId(itemId);
    setSelectedItemType(type);
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
    setSelectedItemId(null);
    setSelectedItemType(null);
  };

  const renderSettings = () => {
    if (!selectedItemId || !selectedItemType) return null;

    if (selectedItemType === 'section') {
      const section = sections.find(s => s.id === selectedItemId);
      const sectionAsset = assets.find(a => a.type === section?.type);
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
      if (!block || !blockAsset) return null;

      return renderBlockEditor({
        block,
        blockAsset,
        onChange: onBlockSettingsChange
      });
    }
  };

  if (!Array.isArray(sections) || !Array.isArray(blocks) || !Array.isArray(assets)) {
    return null;
  }

  return (
    <div>
      {sections.map((section) => (
        <Box key={section.id} padding="400" background="bg-surface">
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">{section.type}</Text>
              <InlineStack gap="200">
                <Popover
                  active={isSettingsOpen && selectedItemId === section.id}
                  onClose={handleSettingsClose}
                  activator={
                    <Button
                      icon={SettingsIcon}
                      onClick={() => handleSettingsClick(section.id, 'section')}
                    />
                  }
                  preferredAlignment="left"
                >
                  <Box padding="400" minWidth="400px">
                    {renderSettings()}
                  </Box>
                </Popover>
              </InlineStack>
            </InlineStack>
            
            {blocks.filter(b => b.id.startsWith(section.id)).map((block) => (
              <Box key={block.id} padding="400" background="bg-surface-secondary">
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd">{block.type}</Text>
                  <InlineStack gap="200">
                    <Popover
                      active={isSettingsOpen && selectedItemId === block.id}
                      onClose={handleSettingsClose}
                      activator={
                        <Button
                          icon={SettingsIcon}
                          onClick={() => handleSettingsClick(block.id, 'block')}
                        />
                      }
                      preferredAlignment="left"
                    >
                      <Box padding="400" minWidth="400px">
                        {renderSettings()}
                      </Box>
                    </Popover>
                  </InlineStack>
                </InlineStack>
              </Box>
            ))}
          </BlockStack>
        </Box>
      ))}
    </div>
  );
}