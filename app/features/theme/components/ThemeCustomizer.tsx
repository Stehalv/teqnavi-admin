import { Box } from "@shopify/polaris";
import { useState } from "react";
import type { Section, Block, ThemeAsset } from "../types.js";
import { SectionList } from "./SectionList.js";
import { SectionSettings } from "./SectionSettings.js";
import { BlockSettings } from "./BlockSettings.js";
import type { SourcedItem } from "./AssetPicker.js";

interface ThemeCustomizerProps {
  sections: Section[];
  blocks: Block[];
  assets: (ThemeAsset & { source?: 'section' | 'custom' | 'common' })[];
  onSectionSettingsChange: (section: Section) => void;
  onBlockSettingsChange: (block: Block) => void;
  onSectionAdd: (section: SourcedItem) => void;
  onBlockAdd: (block: SourcedItem, sectionId: string) => void;
  onSectionDelete: (sectionId: string) => void;
  onBlockDelete: (blockId: string) => void;
}

export function ThemeCustomizer({
  sections = [],
  blocks = [],
  assets = [],
  onSectionSettingsChange,
  onBlockSettingsChange,
  onSectionAdd,
  onBlockAdd,
  onSectionDelete,
  onBlockDelete
}: ThemeCustomizerProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'section' | 'block' | null>(null);

  const handleSettingsClick = (itemId: string, type: 'section' | 'block') => {
    setSelectedItemId(itemId);
    setSelectedItemType(type);
  };

  const handleDelete = (itemId: string, type: 'section' | 'block') => {
    if (type === 'section') {
      onSectionDelete(itemId);
    } else {
      onBlockDelete(itemId);
    }
  };

  const renderSettings = () => {
    if (!selectedItemId || !selectedItemType) return null;

    if (selectedItemType === 'section') {
      const section = sections.find(s => s.id === selectedItemId);
      const sectionAsset = assets.find(a => a.type === section?.type);
      if (!section || !sectionAsset) return null;

      return (
        <SectionSettings
          section={section}
          sectionAsset={sectionAsset}
          onChange={onSectionSettingsChange}
        />
      );
    } else {
      const block = blocks.find(b => b.id === selectedItemId);
      const blockAsset = assets.find(a => a.type === block?.type);
      if (!block || !blockAsset) return null;

      return (
        <BlockSettings
          block={block}
          blockAsset={blockAsset}
          onChange={onBlockSettingsChange}
        />
      );
    }
  };

  return (
    <Box padding="400">
      <SectionList
        sections={sections}
        blocks={blocks}
        assets={assets}
        selectedItemId={selectedItemId}
        onSettingsClick={handleSettingsClick}
        onDelete={handleDelete}
        onSectionAdd={onSectionAdd}
        onBlockAdd={onBlockAdd}
        renderSettings={renderSettings}
      />
    </Box>
  );
}