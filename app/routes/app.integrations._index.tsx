import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import {
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  ButtonGroup,
  Button,
  Box,
  BlockStack
} from '@shopify/polaris';
import { integrationRegistry } from '~/integrations/core/registry.js';
import { authenticate } from "~/shopify.server.js";

interface LoaderData {
  integrations: Array<{
    id: string;
    name: string;
    isConnected: boolean;
    isEnabled: boolean;
    lastSync?: string;
  }>;
  host: string;
}

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const host = url.searchParams.get("host")!;

  // In a real implementation, we would fetch the actual status of each integration
  const providers = integrationRegistry.getAvailableProviders();
  
  const integrations = providers.map(name => ({
    id: name,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    isConnected: false,
    isEnabled: false,
    lastSync: undefined
  }));

  return json<LoaderData>({ integrations, host });
}

export default function IntegrationsRoute() {
  const { integrations, host } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const handleItemClick = (itemId: string) => {
    navigate(`/app/integrations/${itemId}?host=${host}`);
  };

  return (
    <Page title="Integrations">
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList
              items={integrations}
              renderItem={(item) => (
                <ResourceItem
                  id={item.id}
                  onClick={() => handleItemClick(item.id)}
                  accessibilityLabel={`Configure ${item.name} integration`}
                >
                  <BlockStack gap="400">
                    <Layout>
                      <Layout.Section>
                        <BlockStack gap="200">
                          <Text variant="headingMd" as="h3">
                            {item.name}
                          </Text>
                          <Text variant="bodySm" as="p" tone="subdued">
                            {item.lastSync 
                              ? `Last synced: ${new Date(item.lastSync).toLocaleString()}`
                              : 'Never synced'
                            }
                          </Text>
                        </BlockStack>
                      </Layout.Section>
                      <Layout.Section variant="oneThird">
                        <ButtonGroup>
                          <Badge tone={item.isConnected ? 'success' : 'critical'}>
                            {item.isConnected ? 'Connected' : 'Disconnected'}
                          </Badge>
                          <Button
                            variant={item.isEnabled ? 'primary' : 'secondary'}
                            onClick={() => {
                              // Handle enable/disable
                            }}
                          >
                            {item.isEnabled ? 'Enabled' : 'Disabled'}
                          </Button>
                          <Button 
                            onClick={() => {
                              // Handle sync
                            }}
                          >
                            Sync Now
                          </Button>
                        </ButtonGroup>
                      </Layout.Section>
                    </Layout>
                  </BlockStack>
                </ResourceItem>
              )}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 