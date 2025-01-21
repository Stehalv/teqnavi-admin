import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { validateShopAccess } from '~/middleware/auth.server.js';
import { RendererService } from '~/features/pagebuilder/services/renderer.server.js';
import { PageService } from '~/features/pagebuilder/services/page.server.js';
import type { PageUI } from '~/features/pagebuilder/types/shopify.js';

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { shopId } = await validateShopAccess(request);
    const { section, sectionKey } = await request.json();

    if (!section || !sectionKey) {
      return json({ 
        error: 'Missing required fields',
        details: {
          section: !section ? 'Section is required' : undefined,
          sectionKey: !sectionKey ? 'Section key is required' : undefined
        }
      }, { status: 400 });
    }

    console.log('Rendering section:', { 
      shopId, 
      sectionType: section.type,
      sectionKey,
      hasBlocks: !!section.blocks,
      blockOrder: section.block_order
    });

    const html = await RendererService.renderSection(shopId, section, sectionKey);
    
    console.log('Section rendered successfully');
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error rendering section:', error);
    
    return json({
      error: 'Failed to render section',
      details: error instanceof Error ? {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function loader({ request }: ActionFunctionArgs) {
  try {
    const { shopId } = await validateShopAccess(request);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return json({ error: "Missing page ID" }, { status: 400 });
    }

    const page = await PageService.getPage(shopId, id);
    if (!page) {
      return json({ error: "Page not found" }, { status: 404 });
    }

    // Convert to PageUI format
    const pageUI: PageUI = {
      ...page,
      settings: {} // Initialize with empty settings if none exist
    };

    return json({ page: pageUI });
  } catch (error) {
    console.error("Error fetching page:", error);
    return json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
} 