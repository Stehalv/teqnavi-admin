import { json, LoaderFunctionArgs } from "@remix-run/node";
import { validateShopAccess } from "~/middleware/auth.server.js";
import { loadFileAssets, loadDatabaseAssets } from "~/features/theme/services/assets.server.js";

export async function loader({ request }: LoaderFunctionArgs) {
  // Validate shop access and get shopId
  const { shopId } = await validateShopAccess(request);

  // Get query parameters
  const url = new URL(request.url);
  const type = url.searchParams.get('type') as 'section' | 'block' | null;
  const sectionId = url.searchParams.get('sectionId');

  try {
    // Load sections
    const [fileSections, dbSections] = await Promise.all([
      loadFileAssets('section', shopId),
      loadDatabaseAssets(shopId, 'section')
    ]);

    // Load blocks
    const [fileBlocks, dbBlocks] = await Promise.all([
      loadFileAssets('block', shopId),
      loadDatabaseAssets(shopId, 'block', sectionId || undefined)
    ]);

    return json({
      sections: [...fileSections, ...dbSections],
      blocks: [...fileBlocks, ...dbBlocks]
    });
  } catch (error) {
    console.error('Error loading assets:', error);
    return json({ sections: [], blocks: [] }, { status: 500 });
  }
} 