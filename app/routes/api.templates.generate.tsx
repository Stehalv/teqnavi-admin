import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { AIService } from "~/features/pagebuilder/services/ai.server.js";
import { validateShopAccess } from "~/middleware/auth.server.js";

export const action: ActionFunction = async ({ request }) => {
  const { shopId } = await validateShopAccess(request);
  
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const formData = await request.formData();
  const prompt = formData.get('prompt');

  if (!prompt || typeof prompt !== 'string') {
    return json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const result = await AIService.generatePage(shopId, prompt);

    return json({ 
      success: true, 
      data: result
    });
  } catch (error) {
    console.error('Error generating templates:', error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}; 