import { Page, Layout, Card, FormLayout, TextField, Button } from "@shopify/polaris";
import { authenticate } from "../shopify.server.js";
import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { prisma } from "../db.server.js";
import { useState } from "react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return json({ error: "Name is required" });
  }

  const flow = await prisma.enrollmentflow.create({
    data: {
      shopId: session.shop,
      name,
      description,
      isActive: false
    }
  });

  return redirect(`/app/flows/${flow.id}`);
};

export default function NewFlow() {
  const actionData = useActionData<typeof action>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <Page
      title="Create New Flow"
      backAction={{ content: "Flows", url: "/app/flows" }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Form method="post">
              <FormLayout>
                <TextField
                  label="Name"
                  name="name"
                  value={name}
                  onChange={setName}
                  autoComplete="off"
                  error={actionData?.error}
                />
                <TextField
                  label="Description"
                  name="description"
                  value={description}
                  onChange={setDescription}
                  multiline={3}
                  autoComplete="off"
                />
                <Button submit variant="primary">Create Flow</Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 