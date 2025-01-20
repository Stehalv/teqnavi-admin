import { json } from "@remix-run/node";
import { TemplateService } from "~/features/pagebuilder/services/template.server.js";
import { validateShopAccess } from "~/middleware/auth.server.js";

export async function loader({ request }: { request: Request }) {
  try {
    const { shopId } = await validateShopAccess(request);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      const template = await TemplateService.getSectionTemplate(shopId, id);
      if (!template) {
        return json({ error: "Template not found" }, { status: 404 });
      }
      return json({ template });
    }

    const templates = await TemplateService.listSectionTemplates(shopId);
    return json({ templates });
  } catch (error) {
    console.error('Template API error:', error);
    return json({ 
      error: error instanceof Error ? error.message : "An error occurred" 
    }, { status: 500 });
  }
}

export async function action({ request }: { request: Request }) {
  try {
    const { shopId } = await validateShopAccess(request);

    switch (request.method) {
      case 'POST': {
        const data = await request.json();
        const template = await TemplateService.createSectionTemplate(shopId, data);
        return json({ template }, { status: 201 });
      }

      case 'PUT': {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        if (!id) {
          return json({ error: "Template ID required" }, { status: 400 });
        }

        const data = await request.json();
        const template = await TemplateService.updateSectionTemplate(shopId, id, data);
        return json({ template });
      }

      case 'DELETE': {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        if (!id) {
          return json({ error: "Template ID required" }, { status: 400 });
        }

        await TemplateService.deleteSectionTemplate(shopId, id);
        return json({ success: true });
      }

      default:
        return json({ error: "Method not allowed" }, { status: 405 });
    }
  } catch (error) {
    console.error('Template API error:', error);
    return json({ 
      error: error instanceof Error ? error.message : "An error occurred" 
    }, { status: 500 });
  }
} 