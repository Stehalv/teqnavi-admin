import crypto from "crypto";

export function verifyAppProxyHmac(query: URLSearchParams): boolean {
  // Get the signature from the query parameters
  const signature = query.get('signature');
  if (!signature) return false;

  // Remove the signature from the query parameters
  query.delete('signature');

  // Sort the parameters
  const params = Array.from(query.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('');

  // Calculate HMAC
  const hmac = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET || '')
    .update(params)
    .digest('hex');

  // Compare the calculated HMAC with the signature
  return hmac === signature;
} 