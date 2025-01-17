import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server.js";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const asset = await prisma.themeAsset.findUnique({
    where: { id: params.id }
  });

  if (!asset) {
    throw new Response("Not Found", { status: 404 });
  }

  // For pages, we need to process the JSON content and combine sections
  if (asset.type === 'page') {
    const pageContent = JSON.parse(asset.content);
    const html = await generatePageHtml(pageContent, params.id);
    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
        "X-Frame-Options": "SAMEORIGIN"
      },
    });
  }

  // For sections and snippets, return the content directly
  return new Response(asset.content, {
    headers: {
      "Content-Type": "text/html",
      "X-Frame-Options": "SAMEORIGIN"
    },
  });
};

async function generatePageHtml(content: any, pageId: string) {
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
        return `<div id="shopify-section-${sectionId}" class="shopify-section">
          <div class="section-${section.type}" data-section-id="${sectionId}" data-section-type="${section.type}">
            Section not found: ${section.type}
          </div>
        </div>`;
      }

      let sectionContent = sectionAsset.content;
      
      // Extract schema
      const schemaMatch = sectionContent.match(/{% schema %}([\s\S]*?){% endschema %}/);
      const schema = schemaMatch ? JSON.parse(schemaMatch[1]) : { settings: [], blocks: [] };
      
      // Remove schema from content
      sectionContent = sectionContent.replace(/{% schema %}[\s\S]*?{% endschema %}/, '');
      
      // Replace section variables
      sectionContent = sectionContent.replace(
        /{{ section.settings.([\w.]+) }}/g,
        (match, key) => section.settings[key] || ''
      );

      // Process blocks if they exist
      if (section.blocks) {
        let blocksContent = '';
        section.blocks.forEach((block: any) => {
          // Create block content with proper attributes
          const blockContent = `<div id="block-${block.id}" 
            class="shopify-section__block" 
            data-block-id="${block.id}"
            data-block-type="${block.type}">
            ${Object.entries(block.settings || {}).reduce(
              (content, [key, value]) => 
                content.replace(
                  new RegExp(`{{ block.settings.${key} }}`, 'g'),
                  String(value)
                ),
              sectionContent.match(new RegExp(`{% when '${block.type}' %}([\\s\\S]*?)(?:{% when|{% endcase})`))?.[1] || ''
            )}
          </div>`;
          
          blocksContent += blockContent;
        });

        // Replace blocks placeholder
        sectionContent = sectionContent.replace(
          /{% for block in section.blocks %}[\s\S]*?{% endfor %}/,
          blocksContent
        );
      }

      // Clean up any remaining Liquid syntax
      sectionContent = sectionContent
        .replace(/{%.*?%}/g, '') // Remove any remaining Liquid tags
        .replace(/{{.*?}}/g, ''); // Remove any remaining Liquid variables

      return `<div id="shopify-section-${sectionId}" 
        class="shopify-section"
        data-section-id="${sectionId}"
        data-section-type="${section.type}">
        ${sectionContent}
      </div>`;
    })
  );

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
          .shopify-section { margin: 0; }
          .page-width { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
          .section { margin: 0; }
        </style>
      </head>
      <body>
        <div id="MainContent" class="content-for-layout">
          ${sectionsHtml.join('\n')}
        </div>
      </body>
    </html>
  `;
} 