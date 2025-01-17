import { Page, Layout, Card, ResourceList, Button, Text, Badge, TextField } from "@shopify/polaris";
import { authenticate } from "../shopify.server.js";
import { useLoaderData, Link } from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getFlows } from "../models/flow.server.js";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  const flows = await getFlows(session.shop);

  return json({ flows });
};

export default function FlowsList() {
  const { flows } = useLoaderData<typeof loader>();

  return (
    <Page
      title="Enrollment Flows"
      primaryAction={
        <Button variant="primary" url="/app/flows/new">Create Flow</Button>
      }
    >
      <Layout>
        <Layout.Section>
          <Card>
            {flows.length === 0 ? (
              <Card>
                <Text as="p" tone="subdued">
                  No flows created yet. Click 'Create Flow' to get started.
                </Text>
              </Card>
            ) : (
              <ResourceList
                items={flows}
                renderItem={(flow) => (
                  <ResourceList.Item
                    id={flow.id}
                    url={`/app/flows/${flow.id}`}
                    accessibilityLabel={`View details for ${flow.name}`}
                  >
                    <Text as="h3" variant="bodyMd" fontWeight="bold">{flow.name}</Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      {flow.description ?? ''}
                    </Text>
                    {flow.isActive ? (
                      <Badge tone="success">Active</Badge>
                    ) : (
                      <Badge tone="attention">Draft</Badge>
                    )}
                  </ResourceList.Item>
                )}
              />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 