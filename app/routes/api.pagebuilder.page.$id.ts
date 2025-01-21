import { json } from '@remix-run/node';
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { validateShopAccess } from '~/middleware/auth.server.js';
import { PageService } from '~/features/pagebuilder/services/page.server.js';

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const { shopId } = await validateShopAccess(request);
    const { id } = params;

    if (!id) {
      return json({ error: 'Page ID is required' }, { status: 400 });
    }

    const page = await PageService.getPage(shopId, id);
    if (!page) {
      return json({ error: 'Page not found' }, { status: 404 });
    }

    return json({ 
      success: true, 
      page: {
        ...page,
        settings: {} // Initialize with empty settings if none exist
      }
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const { shopId } = await validateShopAccess(request);
    const { id } = params;

    if (!id) {
      return json({ error: 'Page ID is required' }, { status: 400 });
    }

    if (request.method !== 'PUT') {
      return json({ error: 'Method not allowed' }, { status: 405 });
    }

    const pageData = await request.json();
    console.log('Updating page:', { shopId, id, pageData });

    const updatedPage = await PageService.updatePage(shopId, id, pageData);
    if (!updatedPage) {
      return json({ error: 'Failed to update page' }, { status: 500 });
    }

    return json({ 
      success: true, 
      page: updatedPage 
    });
  } catch (error) {
    console.error('Error updating page:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to update page' },
      { status: 500 }
    );
  }
} 