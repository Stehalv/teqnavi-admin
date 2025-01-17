import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { authenticate } from "../shopify.server.js";
import { FlowEditor } from "../features/flows/components/FlowEditor/index.js";
import { getFlow } from "../features/flows/api/queries.js";
import { updateFlow } from "../features/flows/api/mutations.js";
import { validateFlow } from "../features/flows/utils/validation.js";
import type { FlowUpdate } from "../features/flows/types.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const flowData = await getFlow(params.id!);
  
  if (!flowData) {
    throw new Response("Not Found", { status: 404 });
  }

  // Get all elements for this flow
  const elements = await prisma.element.findMany({
    where: { flowId: params.id! }
  });

  const flow = {
    id: flowData.id,
    name: flowData.name,
    steps: flowData.steps
      .sort((a, b) => a.order - b.order)
      .map(step => ({
        ...step,
        createdAt: step.createdAt.toISOString(),
        updatedAt: step.updatedAt.toISOString(),
        elements: elements
          .filter(e => e.stepId === step.id)
          .map(e => ({
            ...e,
            createdAt: e.createdAt.toISOString(),
            updatedAt: e.updatedAt.toISOString()
          }))
      })),
    elements: elements.map(e => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString()
    }))
  };

  return json({ 
    flow,
    apiKey: process.env.SHOPIFY_API_KEY || ""
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const flowId = params.id!;
  
  if (request.method === "PUT") {
    const formData = await request.formData();
    const stepsJson = formData.get('steps') as string;
    const { steps } = JSON.parse(stepsJson) as FlowUpdate;
    
    try {
      // First update all steps
      await Promise.all(steps.map(step => 
        prisma.step.upsert({
          where: { id: step.id },
          create: {
            id: step.id,
            name: step.name,
            order: step.order,
            flowId: flowId,
          },
          update: {
            name: step.name,
            order: step.order,
          }
        })
      ));

      // Then handle elements
      await prisma.element.deleteMany({
        where: { flowId }
      });

      const elements = steps.flatMap(step => 
        step.elements.map(element => ({
          ...element,
          stepId: step.id,
          flowId: flowId,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      );

      if (elements.length > 0) {
        await prisma.element.createMany({
          data: elements
        });
      }

      return json({ success: true });
    } catch (error) {
      console.error(error);
      return json({ 
        error: "Failed to save changes",
        details: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 });
    }
  }

  return json({ error: "Method not allowed" }, { status: 405 });
};

export default function FlowEditorPage() {
  const { flow, apiKey } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();

  return (
    <FlowEditor
      flow={flow}
      isSubmitting={navigation.state === "submitting"}
      onSave={(update) => {
        submit(
          { steps: JSON.stringify(update) },
          { method: "PUT", encType: "application/x-www-form-urlencoded" }
        );
      }}
    />
  );
} 