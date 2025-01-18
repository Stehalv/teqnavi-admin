import { useState, useMemo } from "react";
import type { ProcessedAsset } from "../types.js";

type BlockTab = 'block' | 'custom' | 'common';
type SectionTab = 'custom' | 'common';
type AssetTab = BlockTab | SectionTab;

interface UseAssetPickerOptions {
  mode: 'section' | 'block';
  assets: ProcessedAsset[];
  currentSectionId?: string;
}

interface UseAssetPickerResult {
  activeTab: AssetTab;
  setActiveTab: (tab: AssetTab) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  filteredAssets: ProcessedAsset[];
  tabCounts: {
    block?: number;
    custom: number;
    common: number;
  };
}

/**
 * Hook for managing asset picker state and filtering
 */
export function useAssetPicker({ mode, assets, currentSectionId }: UseAssetPickerOptions): UseAssetPickerResult {
  const [activeTab, setActiveTab] = useState<AssetTab>(
    mode === 'block' ? (currentSectionId ? 'block' : 'custom') : 'custom'
  );
  const [searchValue, setSearchValue] = useState('');

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Filter by mode
      if (asset.type !== mode) return false;

      // Filter by search value
      if (searchValue && !asset.name.toLowerCase().includes(searchValue.toLowerCase())) {
        return false;
      }

      // Filter by tab
      if (mode === 'block') {
        switch (activeTab) {
          case 'block':
            // For blocks tab, show blocks from current section
            return currentSectionId && asset.sectionId === currentSectionId;
          case 'custom':
            // For custom tab, show blocks from database
            return asset.source === 'custom';
          case 'common':
            // For common tab, show blocks from theme-app-extension
            return asset.source === 'common';
          default:
            return false;
        }
      } else {
        switch (activeTab) {
          case 'custom':
            // For custom tab, show sections from database
            return asset.source === 'custom';
          case 'common':
            // For common tab, show sections from theme-app-extension
            return asset.source === 'common';
          default:
            return false;
        }
      }
    });
  }, [assets, mode, activeTab, searchValue, currentSectionId]);

  const tabCounts = useMemo(() => {
    const counts = {
      custom: assets.filter(asset => 
        asset.type === mode && 
        asset.source === 'custom'
      ).length,
      common: assets.filter(asset => 
        asset.type === mode && 
        asset.source === 'common'
      ).length
    };

    if (mode === 'block' && currentSectionId) {
      return {
        ...counts,
        block: assets.filter(asset => 
          asset.type === mode && 
          asset.sectionId === currentSectionId
        ).length
      };
    }

    return counts;
  }, [assets, mode, currentSectionId]);

  return {
    activeTab,
    setActiveTab,
    searchValue,
    setSearchValue,
    filteredAssets,
    tabCounts
  };
} 