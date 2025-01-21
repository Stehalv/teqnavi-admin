import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { validateShopAccess } from '~/middleware/auth.server.js';
import { TemplateService } from '~/features/pagebuilder/services/template.server.js';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { shopId } = await validateShopAccess(request);
    const sections = await TemplateService.listSectionDefinitions(shopId);
    
    return json({ sections });
  } catch (error) {
    console.error('Error loading sections:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to load sections' },
      { status: 500 }
    );
  }
} 