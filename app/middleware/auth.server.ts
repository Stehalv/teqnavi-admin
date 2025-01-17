import { authenticate } from "../shopify.server.js";
import { verifyAppProxyHmac } from "../utils/proxy.server.js";
import { json } from "@remix-run/node";

interface AuthResult {
  shopId: string;
  isAdmin: boolean;
}

export async function validateShopAccess(request: Request): Promise<AuthResult> {
  const url = new URL(request.url);
  const isProxyRoute = url.pathname.startsWith('/proxy');

  if (isProxyRoute) {
    // For proxy routes, validate HMAC
    const isValid = verifyAppProxyHmac(url.searchParams);
    if (!isValid) {
      throw json({ message: 'Invalid signature' }, { status: 401 });
    }
    const shop = url.searchParams.get('shop');
    if (!shop) {
      throw json({ message: 'Missing shop parameter' }, { status: 400 });
    }
    return { shopId: shop, isAdmin: false };
  } else {
    // For admin routes, use Shopify authentication
    const { session } = await authenticate.admin(request);
    return { shopId: session.shop, isAdmin: true };
  }
}

export async function validateShopResource(shopId: string, resourceShopId: string) {
  if (shopId !== resourceShopId) {
    throw json({ message: 'Resource does not belong to this shop' }, { status: 403 });
  }
  return true;
} 