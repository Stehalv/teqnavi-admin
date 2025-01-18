import fs from "fs/promises";
import { prisma } from "~/db.server.js";
import type { ThemeAsset, ProcessedAsset } from "../types.js";

/**
 * Extract schema from liquid file content
 */
function extractSchema(content: string): Record<string, any> {
  const schemaMatch = content.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
  if (!schemaMatch) return { schema: [] };
  
  try {
    const schema = JSON.parse(schemaMatch[1]);
    return {
      schema: schema.settings || []
    };
  } catch (error) {
    console.error('Failed to parse schema:', error);
    return { schema: [] };
  }
}

/**
 * Load assets from the theme-app-extension directory
 */
export async function loadFileAssets(type: 'section' | 'block', shopId: string): Promise<ProcessedAsset[]> {
  const directory = type === 'section' ? 'sections' : 'blocks';
  const files = await fs.readdir(`extensions/theme-app-extension/${directory}`);
  
  return Promise.all(
    files.filter(file => file.endsWith('.liquid')).map(async (file) => {
      const name = file.replace('.liquid', '');
      const content = await fs.readFile(`extensions/theme-app-extension/${directory}/${file}`, 'utf8');
      const { schema } = extractSchema(content);
      const now = new Date().toISOString();
      
      return {
        id: name,
        shopId,
        name: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        type: name,
        content,
        settings: { schema },
        template_format: 'liquid',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        handle: name,
        renderedHtml: null,
        html: null,
        source: type === 'section' ? 'section' : 'common'
      };
    })
  );
}

/**
 * Transform a database asset into a processed asset
 */
export function transformDatabaseAsset(asset: ThemeAsset): ProcessedAsset {
  return {
    ...asset,
    settings: typeof asset.settings === 'string' ? JSON.parse(asset.settings) : {},
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
    source: 'custom'
  };
}

/**
 * Load assets from the database
 */
export async function loadDatabaseAssets(shopId: string, type: 'section' | 'block', sectionId?: string) {
  const assets = await prisma.themeAsset.findMany({
    where: {
      shopId,
      type,
      ...(sectionId ? { sectionId } : {})
    }
  });

  return assets.map(transformDatabaseAsset);
}

/**
 * Load a single asset by ID
 */
export async function loadAssetById(id: string, shopId: string) {
  const asset = await prisma.themeAsset.findFirst({
    where: {
      id,
      shopId
    }
  });

  return asset ? transformDatabaseAsset(asset) : null;
} 