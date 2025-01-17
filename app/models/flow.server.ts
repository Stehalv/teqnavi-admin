import { prisma } from "~/db.server.js";
import type { Step } from "./step.server.js";

console.log('Available models:', Object.keys(prisma));

export interface Flow {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  isActive: boolean;
  steps: Step[];
  createdAt: Date;
  updatedAt: Date;
}

export async function getFlows(shopId: string) {
  return prisma.enrollmentflow.findMany({
    where: {
      shopId
    }
  });
}

export async function getFlow(flowId: string, shopId: string) {
  return prisma.enrollmentflow.findUnique({
    where: {
      id: flowId,
      shopId
    }
  });
}

export async function createFlow(data: { name: string; description?: string }, shopId: string) {
  return prisma.enrollmentflow.create({
    data: {
      ...data,
      shopId,
      isActive: false
    }
  });
} 