import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { validateShopAccess } from '~/middleware/auth.server.js';
import { PageService } from '~/features/pagebuilder/services/page.server.js';

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== 'DELETE') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { shopId } = await validateShopAccess(request);
    const { id } = params;

    if (!id) {
      return json({ error: 'Page ID is required' }, { status: 400 });
    }

    await PageService.deletePage(shopId, id);
    return json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to delete page' },
      { status: 500 }
    );
  }
} 