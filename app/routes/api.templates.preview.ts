import { json } from "@remix-run/node";
import { RendererService } from "~/features/pagebuilder/services/renderer.server.js";
import { requireShopId } from "~/utils/auth.server.js";
import type { Section } from "~/features/pagebuilder/types.js";

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const shopId = await requireShopId(request);
    const data = await request.json();

    if (!data.section) {
      return json({ error: "Section data required" }, { status: 400 });
    }

    const html = await RendererService.previewSection(shopId, data.section as Section);
    return json({ html });
  } catch (error) {
    console.error('Preview generation error:', error);
    return json({ 
      error: error instanceof Error ? error.message : "Failed to generate preview" 
    }, { status: 500 });
  }
} 