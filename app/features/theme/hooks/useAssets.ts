import { useFetcher } from "@remix-run/react";
import { useCallback, useEffect } from "react";
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

  console.log('Raw Fetcher Data:', fetcher.data);

  const sections = fetcher.data?.sections.map(section => {
    console.log('Processing Section:', section);
    return {
      ...section,
      settings: section.settings || {}
    };
  }) ?? [];

  const blocks = fetcher.data?.blocks.map(block => {
    console.log('Processing Block:', block);
    return {
      ...block,
      settings: block.settings || {}
    };
  }) ?? [];

  console.log('Processed Sections:', sections);
  console.log('Processed Blocks:', blocks);

  return {
    sections,
    blocks,
    isLoading: fetcher.state === 'loading',
    reload: loadAssets
  };
} 