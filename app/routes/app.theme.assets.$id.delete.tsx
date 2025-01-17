import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server.js";
import { validateShopAccess } from "~/middleware/auth.server.js";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { shopId } = await validateShopAccess(request);
  const url = new URL(request.url);
  const host = url.searchParams.get("host")!;

  // Get the page and validate ownership
  const page = await prisma.themeAsset.findFirst({
    where: {
      id: params.id,
      shopId
    }
  });

  if (!page) {
    return json({ error: 'Page not found' }, { status: 404 });
  }

  await prisma.themeAsset.delete({
    where: {
      id: params.id,
      shopId
    }
  });

  return redirect(`/app/theme/assets?host=${host}`);
};

// This page will never be rendered - it's just for handling the DELETE action
export default function DeleteAssetPage() {
  return null;
} 