import { json } from "@remix-run/node";
import { TemplateService } from "~/features/pagebuilder/services/template.server.js";
import { validateShopAccess } from "~/middleware/auth.server.js";

export async function loader({ request }: { request: Request }) {
  try {
    const { shopId } = await validateShopAccess(request);
    const url = new URL(request.url);
    const sectionType = url.searchParams.get('sectionType');

    if (!sectionType) {
      return json({ error: "Section type required" }, { status: 400 });
    }

    const templates = await TemplateService.listBlockTemplates(shopId, sectionType);
    return json({ templates });
  } catch (error) {
    console.error('Block template API error:', error);
    return json({ 
      error: error instanceof Error ? error.message : "An error occurred" 
    }, { status: 500 });
  }
}

export async function action({ request }: { request: Request }) {
  try {
    const { shopId } = await validateShopAccess(request);
    const url = new URL(request.url);
    const sectionId = url.searchParams.get('sectionId');
    const blockId = url.searchParams.get('blockId');

    if (!sectionId) {
      return json({ error: "Section ID required" }, { status: 400 });
    }

    switch (request.method) {
      case 'POST': {
        const data = await request.json();
        const block = await TemplateService.createBlockTemplate(shopId, sectionId, data);
        return json({ template: block }, { status: 201 });
      }

      case 'PUT': {
        if (!blockId) {
          return json({ error: "Block ID required" }, { status: 400 });
        }

        const data = await request.json();
        const block = await TemplateService.updateBlockTemplate(shopId, blockId, data);
        return json({ template: block });
      }

      default:
        return json({ error: "Method not allowed" }, { status: 405 });
    }
  } catch (error) {
    console.error('Block template API error:', error);
    return json({ 
      error: error instanceof Error ? error.message : "An error occurred" 
    }, { status: 500 });
  }
} 