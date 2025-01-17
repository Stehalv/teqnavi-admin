import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "../db.server.js";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop');
  const origin = request.headers.get('origin');

  if (!shop) {
    return json({ error: 'Shop parameter is required' }, { status: 400 });
  }

  // Get template from database
  const template = await prisma.liquidTemplate.findUnique({
    where: {
      shopId_name: {
        shopId: shop,
        name: 'enrollment_form'
      }
    }
  });

  return json({
    template: template?.content || '<p>No template content found</p>',
    debug: { shop }
  }, {
    headers: {
      'Access-Control-Allow-Origin': origin || 'https://teqnavi-demo-store-1.myshopify.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
};

// Handle OPTIONS preflight request
export const action = async ({ request }: LoaderFunctionArgs) => {
  const origin = request.headers.get('origin');

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': origin || 'https://teqnavi-demo-store-1.myshopify.com',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin',
        'Access-Control-Allow-Credentials': 'true'
      }
    });
  }
  
  return json({ error: 'Method not allowed' }, { status: 405 });
}; 