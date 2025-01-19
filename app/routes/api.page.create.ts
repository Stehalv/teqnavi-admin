import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { PageService } from "~/features/pagebuilder/services/page.server.js";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { shopId, title } = await request.json();
    
    if (!shopId || !title) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    const page = await PageService.createPage(shopId, { title });
    return json({ page });
  } catch (error) {
    console.error("Error creating page:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error occurred" }, { status: 500 });
  }
} 