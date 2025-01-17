import { prisma } from "~/db.server.js";
import type { FlowUpdate } from "../types.js";

export async function updateFlow(flowId: string, updates: FlowUpdate) {
  return await prisma.$transaction(async (tx) => {
    for (const step of updates.steps) {
      await tx.step.upsert({
        where: { id: step.id },
        create: {
          id: step.id,
          name: step.name,
          order: step.order,
          flowId,
        },
        update: {
          name: step.name,
          order: step.order,
        },
      });

      for (const element of step.elements) {
        await tx.element.upsert({
          where: { id: element.id },
          create: {
            id: element.id,
            type: element.type,
            label: element.label,
            config: element.config,
            order: element.order,
            flowId,
          },
          update: {
            label: element.label,
            config: element.config,
            order: element.order,
          },
        });
      }
    }
  });
} 