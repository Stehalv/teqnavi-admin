import { json } from '@remix-run/node';
import { validateShopAccess } from '~/middleware/auth.server.js';
import { TemplateService } from '~/features/pagebuilder/services/template.server.js';

export async function loader({ request, params }: { request: Request; params: { sectionType: string } }) {
  const { shopId } = await validateShopAccess(request);
  const { sectionType } = params;

  try {
    const template = await TemplateService.getSectionDefinition(shopId, sectionType);
    if (!template) {
      throw new Error(`Template not found for section type: ${sectionType}`);
    }

    return json({
      schema: template.schema,
      liquid: template.liquid,
      styles: template.styles
    });
  } catch (error) {
    console.error('Error loading template:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to load template' },
      { status: 500 }
    );
  }
}

export async function action({ request, params }: { request: Request; params: { sectionType: string } }) {
  const { shopId } = await validateShopAccess(request);
  const { sectionType } = params;

  if (request.method !== 'PUT') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const data = await request.json();
    const { schema, liquid, styles } = data;

    await TemplateService.saveAIGeneratedTemplate(shopId, sectionType, {
      schema: typeof schema === 'string' ? schema : JSON.stringify(schema),
      liquid,
      styles,
      snippets: {},
      sections: {}
    });

    return json({ success: true });
  } catch (error) {
    console.error('Error saving template:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to save template' },
      { status: 500 }
    );
  }
} 