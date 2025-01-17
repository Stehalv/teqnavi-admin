import { prisma } from "~/db.server.js";

export async function getFlow(flowId: string) {
  return prisma.enrollmentflow.findUnique({
    where: { id: flowId },
    include: { 
      steps: true,
      elements: true
    }
  });
}

export async function getFlows(shopId: string) {
  return prisma.enrollmentflow.findMany({
    where: { shopId },
    orderBy: { updatedAt: 'desc' }
  });
} 