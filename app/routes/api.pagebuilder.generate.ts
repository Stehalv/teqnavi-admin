import { json } from '@remix-run/node';
import { validateShopAccess } from '~/middleware/auth.server.js';
import { PageBuilderAI } from '~/features/pagebuilder/services/pagebuilder-ai.server.js';
import type { ShopifyPageJSON } from '~/features/pagebuilder/types/shopify.js';

export async function action({ request }: { request: Request }) {
  const { shopId } = await validateShopAccess(request);
  const formData = await request.formData();
  const prompt = formData.get('prompt');

  if (!prompt || typeof prompt !== 'string') {
    return json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const result = await PageBuilderAI.generatePage(shopId, prompt);
    return json(result);
  } catch (error) {
    console.error('Error generating page:', error);
    return json({ error: 'Failed to generate page' }, { status: 500 });
  }
} 