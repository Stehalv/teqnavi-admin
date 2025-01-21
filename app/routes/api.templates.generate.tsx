import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { PageBuilderAI } from "~/features/pagebuilder/services/pagebuilder-ai.server.js";
import { validateShopAccess } from "~/middleware/auth.server.js";
import type { Section } from "~/features/pagebuilder/types/shopify.js";
import { TemplateService } from "~/features/pagebuilder/services/template.server.js";

export const action: ActionFunction = async ({ request }) => {
  const { shopId } = await validateShopAccess(request);
  
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const formData = await request.formData();
  const prompt = formData.get('prompt');
  const type = formData.get('type');

  if (!type || typeof type !== 'string') {
    return json({ error: "Section type is required" }, { status: 400 });
  }

  try {
    const result = await PageBuilderAI.generateSection(type);
    await TemplateService.saveAIGeneratedTemplate(shopId, type, result);
    return json({ success: true, data: result });
  } catch (error) {
    console.error('Error generating section:', error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}; 