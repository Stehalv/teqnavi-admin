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

  const tabs = mode === 'section' ? [
    {
      id: 'common',
      content: `Common sections (${tabCounts.common})`,
      accessibilityLabel: 'Common sections',
      panelID: 'common-panel'
    },
    {
      id: 'custom',
      content: `Custom sections (${tabCounts.custom})`,
      accessibilityLabel: 'Custom sections',
      panelID: 'custom-panel'
    }
  ] : [
    {
      id: 'block',
      content: `Section (${tabCounts.block ?? 0})`,
      accessibilityLabel: 'Section blocks',
      panelID: 'section-panel'
    },
    {
      id: 'custom',
      content: `Custom (${tabCounts.custom})`,
      accessibilityLabel: 'Custom blocks',
      panelID: 'custom-panel'
    },
    {
      id: 'common',
      content: `Common (${tabCounts.common})`,
      accessibilityLabel: 'Common blocks',
      panelID: 'common-panel'
    }
  ];

  return (
    <div style={{ padding: '8px' }}>
      <div>
        <div style={{ marginBottom: '8px' }}>
          <Box padding="0">
            <Tabs
              tabs={tabs}
              selected={tabs.findIndex(tab => tab.id === activeTab)}
              onSelect={index => setActiveTab(tabs[index].id as 'block' | 'custom' | 'common')}
              fitted
            />
          </Box>
        </div>

        <style>{`
          .CompactTabs :global(.Polaris-Tabs-Tab) {
            min-height: 32px;
            padding: 4px 8px;
          }
        `}</style>

        <div style={{ marginBottom: '8px' }}>
          <TextField
            label="Search"
            value={searchValue}
            onChange={setSearchValue}
            autoComplete="off"
            placeholder={mode === 'section' ? "Search sections..." : "Search blocks..."}
            labelHidden
          />
        </div>

        <div style={{ 
          maxHeight: '400px', 
          overflowY: 'auto',
          borderRadius: 'var(--p-border-radius-200)',
          background: 'var(--p-surface)'
        }}>
          {filteredAssets.map(item => (
            <div
              key={item.id}
              style={{
                padding: 'var(--p-space-200)',
                borderBottom: '1px solid var(--p-border)',
                cursor: 'pointer',
                backgroundColor: 'var(--p-surface)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--p-surface-hovered)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--p-surface)';
              }}
              onClick={() => {
                onSelect(item);
                onClose();
              }}
            >
              <div style={{ 
                fontSize: '14px',
                color: 'var(--p-text)'
              }}>
                {item.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 