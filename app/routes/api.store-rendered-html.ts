import { ActionFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/db.server.js";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { pageId, renderedHtml } = await request.json();

  if (!pageId || !renderedHtml) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await prisma.themeAsset.update({
      where: { id: pageId },
      data: { renderedHtml }
    });

    return json({ success: true });
  } catch (error) {
    console.error('Error storing rendered HTML:', error);
    return json({ error: 'Failed to store rendered HTML' }, { status: 500 });
  }
}; 