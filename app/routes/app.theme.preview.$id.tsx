import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "~/shopify.server.js";
import { prisma } from "~/db.server.js";
import type { SettingValue } from "~/features/theme/types.js";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const host = url.searchParams.get("host")!;
  
  const asset = await prisma.themeAsset.findUnique({
    where: { id: params.id }
  });

  if (!asset) {
    throw new Response("Not Found", { status: 404 });
  }

  // Generate HTML preview from JSON sections
  const content = JSON.parse(asset.content);
  const html = await generatePreviewHtml(content);
  
  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
};

async function generatePreviewHtml(content: any) {
  const sectionsHtml = await Promise.all(
    content.order.map(async (sectionId: string) => {
      const section = content.sections[sectionId];
      const sectionAsset = await prisma.themeAsset.findFirst({
        where: { 
          type: 'section',
          name: section.type 
        }
      });
      
      if (!sectionAsset) {
        return `<div class="section" data-section-id="${sectionId}">Section not found: ${section.type}</div>`;
      }
      
      return `
        <div class="section" data-section-id="${sectionId}">
          ${sectionAsset.content}
        </div>
      `;
    })
  );

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
          .section { margin: 20px 0; }
          .block { padding: 10px; }
        </style>
      </head>
      <body>
        ${sectionsHtml.join('\n')}
      </body>
    </html>
  `;
}

export default function ThemePreviewPage() {
  const { renderedContent } = useLoaderData<typeof loader>();

  return (
    <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
  );
} 