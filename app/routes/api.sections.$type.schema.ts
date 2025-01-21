import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { validateShopAccess } from '~/middleware/auth.server.js';
import { TemplateService } from '~/features/pagebuilder/services/template.server.js';

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    console.log('Schema request received:', {
      params,
      url: request.url
    });

    const { shopId } = await validateShopAccess(request);
    const { type } = params;

    if (!type) {
      console.log('Missing section type');
      return json({ error: 'Section type is required' }, { status: 400 });
    }

    console.log('Fetching schema for:', {
      shopId,
      type
    });

    const template = await TemplateService.getSectionDefinition(shopId, type);
    console.log('Template found:', {
      hasTemplate: !!template,
      schema: template?.schema
    });

    if (!template) {
      return json({ error: 'Section template not found' }, { status: 404 });
    }

    return json({ schema: template.schema });
  } catch (error) {
    console.error('Error fetching section schema:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to fetch section schema' },
      { status: 500 }
    );
  }
} 