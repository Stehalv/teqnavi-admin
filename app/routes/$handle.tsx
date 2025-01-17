import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server.js";
import crypto from "crypto";
import type { ThemeAsset } from "~/features/theme/types.js";

function verifyAppProxyHmac(query: URLSearchParams, secret: string): boolean {
  const signature = query.get('signature');
  if (!signature) {
    console.log('No signature found in query parameters');
    return false;
  }

  // Remove the signature from the query parameters
  query.delete('signature');

  // Sort and join parameters
  const params = Array.from(query.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('');

  console.log('Parameters for HMAC:', params);
  console.log('Using secret:', secret ? 'Secret exists' : 'No secret found');

  // Calculate HMAC
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(params)
    .digest('hex');

  console.log('Calculated HMAC:', hmac);
  console.log('Received signature:', signature);
  
  return hmac === signature;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const queryParams = url.searchParams;
    const preview = queryParams.get('preview') === 'true';
    const versionId = queryParams.get('version');
    const shop = queryParams.get('shop') || 'teqnavi-demo-store-1.myshopify.com';

    // For preview URLs, we don't need to check the path prefix
    const pathPrefix = queryParams.get('path_prefix');
    if (!preview && pathPrefix !== '/a/pages') {
      return new Response('Not Found', { status: 404 });
    }

    // Skip HMAC verification for preview requests
    if (!preview) {
      // Verify the signature
      const isValid = verifyAppProxyHmac(queryParams, process.env.SHOPIFY_API_SECRET || '');
      if (!isValid) {
        return new Response('Unauthorized - Invalid signature', { status: 401 });
      }
    }

    const handle = params.handle;

    // Find the page
    const page = await prisma.themeAsset.findFirst({
      where: {
        handle: handle,
        shopId: shop,
        type: 'page',
        ...(preview ? {} : { isActive: true })
      }
    }) as ThemeAsset | null;

    if (!page) {
      return new Response(JSON.stringify({
        error: 'Page not found',
        requestedHandle: handle
      }, null, 2), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    let content = preview ? page.renderedHtml : page.html;

    // If preview and version specified, get that version's content
    if (preview && versionId) {
      const version = await prisma.themeAssetVersion.findUnique({
        where: { id: versionId }
      });

      if (version && version.themeAssetId === page.id) {
        content = version.renderedHtml || version.html || '';
      }
    }

    if (!content) {
      return new Response(preview ? 'Page has not been rendered yet' : 'Page has not been saved yet', { 
        status: 500 
      });
    }

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "application/liquid",
        "Cache-Control": preview ? "no-cache, no-store" : "public, max-age=300"
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}; 