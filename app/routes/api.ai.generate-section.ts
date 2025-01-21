import { json } from "@remix-run/node";
import { PageBuilderAI } from "~/features/pagebuilder/services/pagebuilder-ai.server.js";
import { validateShopAccess } from "~/middleware/auth.server.js";
import { TemplateService } from "~/features/pagebuilder/services/template.server.js";

export async function action({ request }: { request: Request }) {
  const { shopId } = await validateShopAccess(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { prompt, type } = await request.json();
    
    if (!type) {
      return json({ error: "Section type is required" }, { status: 400 });
    }

    const result = await PageBuilderAI.generateSection(type);
    await TemplateService.saveAIGeneratedTemplate(shopId, type, result);
    
    return json({ success: true, data: result });
  } catch (error) {
    console.error('Error generating section:', error);
    return json({ 
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate section" 
    }, { status: 500 });
  }
} 