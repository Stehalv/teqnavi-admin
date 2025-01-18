import { BlockStack } from "@shopify/polaris";
import type { Section, Block, ProcessedAsset } from "../types.js";
import { ItemHeader } from "./ItemHeader.js";
import { AssetPickerPopover } from "./AssetPickerPopover.js";
import { usePickerState } from "../hooks/usePickerState.js";

interface SectionContentProps {
  section: Section;
  blocks: Block[];
  assets: ProcessedAsset[];
  isCollapsed: boolean;
  selectedItemId: string | null;
  onSettingsClick: (itemId: string, type: 'section' | 'block') => void;
  onDelete: (itemId: string, type: 'section' | 'block') => void;
  onBlockAdd: (block: ProcessedAsset, sectionId: string) => void;
  renderSettings: () => React.ReactNode;
}

export function SectionContent({
  section,
  blocks,
  assets,
  isCollapsed,
  selectedItemId,
  onSettingsClick,
  onDelete,
  onBlockAdd,
  renderSettings
}: SectionContentProps) {
  const { isPickerOpen, openPicker, closePicker } = usePickerState();

  return (
    <BlockStack gap="400">
      {!isCollapsed && blocks.map((block) => (
        <div
          key={block.id}
          style={{
            padding: '16px',
            background: 'var(--p-surface)',
            border: '1px solid var(--p-border)',
            borderRadius: '8px'
          }}
        >
          <ItemHeader
            type={block.type}
            isCollapsed={false}
            onSettingsClick={() => onSettingsClick(block.id, 'block')}
            onDelete={() => onDelete(block.id, 'block')}
          />
        </div>
      ))}

      {!isCollapsed && (
        <div style={{ padding: '16px' }}>
          <AssetPickerPopover
            mode="block"
            assets={assets}
            buttonText="Add block"
            isOpen={isPickerOpen('block')}
            onClose={closePicker}
            onSelect={(item) => {
              onBlockAdd(item, section.id);
              closePicker();
            }}
            onClick={() => openPicker('block')}
            currentSectionId={section.id}
          />
        </div>
      )}

      {selectedItemId && renderSettings()}
    </BlockStack>
  );
} 