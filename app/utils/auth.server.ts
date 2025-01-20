import { redirect } from "@remix-run/node";
import { prisma } from "~/db.server.js";

export async function requireShopId(request: Request): Promise<string> {
  const session = await getSession(request);
  if (!session?.shop) {
    throw redirect("/auth/login");
  }
  return session.shop;
}

async function getSession(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: token },
    select: { shop: true }
  });

  return session;
} 