import { Popover, Button } from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";
import type { ProcessedAsset } from "../types.js";
import { AssetPicker } from "./AssetPicker.js";

interface AssetPickerPopoverProps {
  mode: 'section' | 'block';
  assets: ProcessedAsset[];
  buttonText: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: ProcessedAsset) => void;
  onClick: () => void;
  currentSectionId?: string;
}

export function AssetPickerPopover({
  mode,
  assets,
  buttonText,
  isOpen,
  onClose,
  onSelect,
  onClick,
  currentSectionId
}: AssetPickerPopoverProps) {
  return (
    <Popover
      active={isOpen}
      activator={
        <Button
          onClick={onClick}
          icon={PlusIcon}
          variant={mode === 'section' ? 'primary' : 'plain'}
          size={mode === 'block' ? 'slim' : 'medium'}
        >
          {buttonText}
        </Button>
      }
      onClose={onClose}
      preferredAlignment="left"
      preferredPosition="below"
    >
      <div style={{ 
        minWidth: '320px',
        maxWidth: '400px',
        maxHeight: '500px',
        overflow: 'auto'
      }}>
        <AssetPicker
          mode={mode}
          assets={assets}
          onSelect={onSelect}
          onClose={onClose}
          currentSectionId={currentSectionId}
        />
      </div>
    </Popover>
  );
} 