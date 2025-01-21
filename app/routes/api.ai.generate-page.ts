import { json } from "@remix-run/node";
import { PageBuilderAI } from "~/features/pagebuilder/services/pagebuilder-ai.server.js";
import { validateShopAccess } from "~/middleware/auth.server.js";
import { PageService } from "~/features/pagebuilder/services/page.server.js";

export async function action({ request }: { request: Request }) {
  const { shopId } = await validateShopAccess(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { prompt } = await request.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return json({ error: "Prompt is required" }, { status: 400 });
    }

    const result = await PageBuilderAI.generatePage(shopId, prompt);
    
    // Parse the page data
    const pageData = JSON.parse(result.page);
    
    // Create or update the page
    const page = await PageService.createPage(shopId, {
      title: pageData.title || "AI Generated Page",
      data: pageData
    });

    return json({ 
      success: true, 
      data: {
        page,
        sections: pageData.sections,
        order: pageData.order,
        settings: pageData.settings
      }
    });
  } catch (error) {
    console.error('Error generating page:', error);
    
    // Get the error details if they exist
    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      // @ts-ignore - custom property
      details: error.details
    } : 'Unknown error';
    
    return json({ 
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate page",
      details: errorDetails
    }, { status: 500 });
  }
} 