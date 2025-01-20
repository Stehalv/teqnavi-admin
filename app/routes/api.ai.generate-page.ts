import { json } from "@remix-run/node";
import { PageBuilderAI } from "~/features/pagebuilder/services/pagebuilder-ai.server.js";
import { validateShopAccess } from "~/middleware/auth.server.js";

export async function action({ request }: { request: Request }) {
  const { shopId } = await validateShopAccess(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { prompt } = await request.json();
    const result = await PageBuilderAI.generatePage(shopId, prompt);
    return json({ success: true, data: result });
  } catch (error) {
    console.error('Error generating page:', error);
    return json({ 
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate page" 
    }, { status: 500 });
  }
} 