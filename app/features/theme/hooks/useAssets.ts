import { useFetcher } from "@remix-run/react";
import { useCallback, useEffect, useMemo } from "react";
import type { ProcessedAsset } from "../types.js";

interface UseAssetsOptions {
  type?: 'section' | 'block';
  sectionId?: string;
  shopId: string;
}

interface UseAssetsReturn {
  sections: ProcessedAsset[];
  blocks: ProcessedAsset[];
  isLoading: boolean;
  reload: () => void;
  assetsMap: Record<string, ProcessedAsset>;
}

/**
 * Hook for loading and managing theme assets
 */
export function useAssets({ type, sectionId, shopId }: UseAssetsOptions): UseAssetsReturn {
  const fetcher = useFetcher<{ sections: ProcessedAsset[], blocks: ProcessedAsset[] }>();
  
  const loadAssets = useCallback(() => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (sectionId) params.append('sectionId', sectionId);
    params.append('shop', shopId);
    
    fetcher.load(`/api/theme/assets?${params}`);
  }, [type, sectionId, shopId]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const sections = fetcher.data?.sections.map(section => ({
    ...section,
    settings: section.settings || {}
  })) ?? [];

  const blocks = fetcher.data?.blocks.map(block => ({
    ...block,
    settings: block.settings || {}
  })) ?? [];

  const assetsMap = useMemo(() => {
    const allAssets = [...sections, ...blocks];
    return allAssets.reduce((acc, asset) => {
      acc[asset.id] = asset;
      return acc;
    }, {} as Record<string, ProcessedAsset>);
  }, [sections, blocks]);

  return {
    sections,
    blocks,
    isLoading: fetcher.state === 'loading',
    reload: loadAssets,
    assetsMap
  };
} 