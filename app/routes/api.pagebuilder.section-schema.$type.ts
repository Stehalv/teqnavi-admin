import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { validateShopAccess } from '~/middleware/auth.server.js';
import { TemplateService } from '~/features/pagebuilder/services/template.server.js';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { shopId } = await validateShopAccess(request);
  const { type } = params;

  if (!type) {
    return json({ error: 'Section type is required' }, { status: 400 });
  }

  try {
    const template = await TemplateService.getSectionDefinition(shopId, type);
    if (!template) {
      return json({ error: 'Template not found' }, { status: 404 });
    }

    return json({ schema: template.schema });
  } catch (error: unknown) {
    console.error('Error fetching section schema:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return json({ error: errorMessage }, { status: 500 });
  }
} 