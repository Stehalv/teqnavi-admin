import { json } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import {
  Page,
  Layout,
  Card,
  Tabs,
  Form,
  FormLayout,
  TextField,
  Button,
  Text,
  BlockStack,
  Box,
  Banner
} from '@shopify/polaris';
import { useState } from 'react';
import { integrationRegistry } from '~/integrations/core/registry.js';

interface LoaderData {
  provider: {
    name: string;
    isConnected: boolean;
    isEnabled: boolean;
    settings: Record<string, string>;
    lastSync?: string;
  };
}

export async function loader({ params }) {
  const providerName = params.provider;
  const provider = integrationRegistry.getProvider(providerName);

  if (!provider) {
    throw new Error(`Provider ${providerName} not found`);
  }

  // In a real implementation, we would fetch the actual provider config
  return json<LoaderData>({
    provider: {
      name: providerName.charAt(0).toUpperCase() + providerName.slice(1),
      isConnected: false,
      isEnabled: false,
      settings: {
        apiKey: '',
        apiSecret: '',
        apiUrl: ''
      },
      lastSync: undefined
    }
  });
}

export default function ProviderRoute() {
  const { provider } = useLoaderData<LoaderData>();
  const [selectedTab, setSelectedTab] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const tabs = [
    {
      id: 'settings',
      content: 'Settings',
      accessibilityLabel: 'Settings',
      panelID: 'settings-panel',
    },
    {
      id: 'mappings',
      content: 'Field Mappings',
      accessibilityLabel: 'Field Mappings',
      panelID: 'mappings-panel',
    },
    {
      id: 'rules',
      content: 'Sync Rules',
      accessibilityLabel: 'Sync Rules',
      panelID: 'rules-panel',
    },
  ];

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // In a real implementation, we would test the connection here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResult({ 
        success: true, 
        message: 'Successfully connected to the API' 
      });
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: 'Failed to connect to the API' 
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async () => {
    // In a real implementation, we would save the settings here
    console.log('Saving settings...');
  };

  return (
    <Page
      title={provider.name}
      backAction={{ content: 'Integrations', url: '/app/config/integrations' }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Tabs
              tabs={tabs}
              selected={selectedTab}
              onSelect={setSelectedTab}
            />
            <Box padding="400">
              {selectedTab === 0 && (
                <BlockStack gap="400">
                  {testResult && (
                    <Banner
                      title={testResult.success ? 'Success' : 'Error'}
                      tone={testResult.success ? 'success' : 'critical'}
                    >
                      <p>{testResult.message}</p>
                    </Banner>
                  )}
                  <Form onSubmit={handleSubmit}>
                    <FormLayout>
                      <TextField
                        label="API Key"
                        type="text"
                        value={provider.settings.apiKey}
                        autoComplete="off"
                      />
                      <TextField
                        label="API Secret"
                        type="password"
                        value={provider.settings.apiSecret}
                        autoComplete="off"
                      />
                      <TextField
                        label="API URL"
                        type="url"
                        value={provider.settings.apiUrl}
                        autoComplete="off"
                      />
                      <Button
                        onClick={handleTestConnection}
                        loading={isTesting}
                      >
                        Test Connection
                      </Button>
                    </FormLayout>
                  </Form>
                </BlockStack>
              )}
              {selectedTab === 1 && (
                <Text as="p">Field mappings configuration will go here</Text>
              )}
              {selectedTab === 2 && (
                <Text as="p">Sync rules configuration will go here</Text>
              )}
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 