import { BlockStack, Button, TextField, InlineStack, ActionList, Scrollable, Box } from "@shopify/polaris";
import { useState } from "react";
import type { ThemeAsset } from "../types.js";

interface SourcedItem {
  source: ItemSource;
  createdAt: string;
  updatedAt: string;
  name: string;
}

type ItemSource = 'app' | 'custom' | 'section';

interface AssetPickerProps {
  mode: 'section' | 'block';
  items: SourcedItem[];
  onSelect: (item: SourcedItem) => void;
  onClose: () => void;
}

export function AssetPicker({ mode, items, onSelect, onClose }: AssetPickerProps) {
  const [activeTab, setActiveTab] = useState<ItemSource>('app');
  const [searchValue, setSearchValue] = useState('');

  const getFilteredItems = () => {
    const searchTerm = searchValue.toLowerCase();
    const filteredBySearch = items.filter(item => 
      item.name.toLowerCase().includes(searchTerm)
    );

    return filteredBySearch.filter(item => {
      if (mode === 'section') {
        if (activeTab === 'app') {
          return item.source === 'app';
        } else if (activeTab === 'custom') {
          return item.source === 'custom';
        }
      } else {
        // For blocks, filter based on the active tab
        return item.source === activeTab;
      }
      return true;
    });
  };

  const getTabCounts = () => {
    const sources: ItemSource[] = mode === 'block' 
      ? ['app', 'section', 'custom']
      : ['app', 'custom'];
    return sources.reduce((acc, source) => ({
      ...acc,
      [source]: items.filter(item => item.source === source).length.toString()
    }), {} as Record<ItemSource, string>);
  };

  const handleSelect = (item: SourcedItem) => {
    onSelect(item);
    onClose();
  };

  return (
    <Box padding="400" width="320px">
      <BlockStack gap="400">
        <TextField
          label={`Search ${mode}s`}
          labelHidden
          value={searchValue}
          onChange={setSearchValue}
          autoComplete="off"
          placeholder={`Search ${mode}s`}
        />
        
        <InlineStack gap="200" align="space-between">
          <Button
            variant="plain"
            pressed={activeTab === 'app'}
            onClick={() => setActiveTab('app')}
          >
            Common ({getTabCounts().app})
          </Button>
          {mode === 'block' && (
            <Button
              variant="plain"
              pressed={activeTab === 'section'}
              onClick={() => setActiveTab('section')}
            >
              Section ({getTabCounts().section})
            </Button>
          )}
          <Button
            variant="plain"
            pressed={activeTab === 'custom'}
            onClick={() => setActiveTab('custom')}
          >
            Custom ({getTabCounts().custom})
          </Button>
        </InlineStack>

        <Scrollable style={{maxHeight: '400px'}}>
          <ActionList
            items={getFilteredItems().map(item => ({
              content: item.name,
              onAction: () => handleSelect(item)
            }))}
          />
        </Scrollable>
      </BlockStack>
    </Box>
  );
} 