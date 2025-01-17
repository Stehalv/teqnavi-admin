import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useParams, Link, useNavigate } from '@remix-run/react';
import { useState } from 'react';
import {
  Page,
  Layout,
  Card,
  Tabs,
  Form,
  FormLayout,
  TextField,
  Button,
  BlockStack,
  Box,
  Banner
} from '@shopify/polaris';
import { authenticate } from "~/shopify.server.js";

interface LoaderData {
  config: {
    apiKey: string;
    secret: string;
    apiUrl: string;
  };
  host: string;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const host = url.searchParams.get("host")!;

  // In a real implementation, we would fetch the actual config
  return json<LoaderData>({
    config: {
      apiKey: '',
      secret: '',
      apiUrl: ''
    },
    host
  });
}

export default function ProviderRoute() {
  const { provider } = useParams();
  const { config, host } = useLoaderData<typeof loader>();
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();

  const tabs = [
    {
      id: 'settings',
      content: 'Settings',
      panelID: 'settings-panel',
    },
    {
      id: 'mappings',
      content: 'Field Mappings',
      panelID: 'mappings-panel',
    },
    {
      id: 'rules',
      content: 'Sync Rules',
      panelID: 'rules-panel',
    },
  ];

  const handleTabChange = (selectedTabIndex: number) => {
    setSelectedTab(selectedTabIndex);
    const tab = tabs[selectedTabIndex];
    if (tab.id === 'mappings') {
      navigate(`/app/integrations/${provider}/mappings?host=${host}`);
    } else if (tab.id === 'rules') {
      navigate(`/app/integrations/${provider}/rules?host=${host}`);
    }
  };

  return (
    <Page
      title={`${provider?.charAt(0).toUpperCase()}${provider?.slice(1)} Integration`}
      backAction={{ content: 'Integrations', url: `/app/integrations?host=${host}` }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Tabs 
              tabs={tabs} 
              selected={selectedTab} 
              onSelect={handleTabChange}
            />
            <Box padding="400">
              <Form onSubmit={() => console.log('Saving settings...')}>
                <FormLayout>
                  <TextField
                    label="API Key"
                    value={config.apiKey}
                    onChange={() => {}}
                    autoComplete="off"
                  />
                  <TextField
                    label="API Secret"
                    value={config.secret}
                    onChange={() => {}}
                    type="password"
                    autoComplete="off"
                  />
                  <TextField
                    label="API URL"
                    value={config.apiUrl}
                    onChange={() => {}}
                    autoComplete="off"
                  />
                  <Button submit>Save Settings</Button>
                  <Button onClick={() => {}}>Test Connection</Button>
                </FormLayout>
              </Form>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 