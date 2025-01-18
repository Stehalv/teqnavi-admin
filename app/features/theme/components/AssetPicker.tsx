import { Box, Tabs, TextField } from "@shopify/polaris";
import type { ProcessedAsset } from "../types.js";
import { useAssetPicker } from "../hooks/useAssetPicker.js";

interface AssetPickerProps {
  mode: 'section' | 'block';
  assets: ProcessedAsset[];
  onSelect: (item: ProcessedAsset) => void;
  onClose: () => void;
  currentSectionId?: string;
}

export function AssetPicker({
  mode,
  assets,
  onSelect,
  onClose,
  currentSectionId
}: AssetPickerProps) {
  const {
    activeTab,
    setActiveTab,
    searchValue,
    setSearchValue,
    filteredAssets,
    tabCounts
  } = useAssetPicker({
    mode,
    assets,
    currentSectionId
  });

  const tabs = [
    {
      id: 'block',
      content: `Section Blocks (${tabCounts.block ?? 0})`,
      accessibilityLabel: 'Section Blocks',
      panelID: 'section-panel'
    },
    {
      id: 'custom',
      content: `Custom Blocks (${tabCounts.custom})`,
      accessibilityLabel: 'Custom Blocks',
      panelID: 'custom-panel'
    },
    {
      id: 'common',
      content: `Common Blocks (${tabCounts.common})`,
      accessibilityLabel: 'Common Blocks',
      panelID: 'common-panel'
    }
  ];

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ width: '568px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Tabs
            tabs={tabs}
            selected={tabs.findIndex(tab => tab.id === activeTab)}
            onSelect={index => setActiveTab(tabs[index].id as 'block' | 'custom' | 'common')}
            fitted
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <TextField
            label="Search"
            value={searchValue}
            onChange={setSearchValue}
            autoComplete="off"
            placeholder="Search blocks..."
            labelHidden
          />
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {filteredAssets.map(item => (
            <div
              key={item.id}
              style={{
                padding: '8px',
                borderBottom: '1px solid var(--p-border)',
                cursor: 'pointer'
              }}
              onClick={() => {
                onSelect(item);
                onClose();
              }}
            >
              <div>{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 