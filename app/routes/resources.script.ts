import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server.js";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop');

  if (!shop) {
    return new Response('Shop parameter required', { status: 400 });
  }

  // Get latest script content from database
  const template = await prisma.liquidTemplate.findUnique({
    where: {
      shopId_name: {
        shopId: shop,
        name: 'enrollment_form'
      }
    }
  });

  // Construct your dynamic JavaScript
  const scriptContent = `
    // Your client-side JavaScript code here
    window.TEQNAVI = {
      template: ${JSON.stringify(template?.content || '')},
      shop: "${shop}"
    };

    // Add your initialization code
    document.addEventListener('DOMContentLoaded', function() {
      console.log("App script loaded for shop:", "${shop}");
      // Your initialization code here
    });
  `;

  return new Response(scriptContent, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}; 