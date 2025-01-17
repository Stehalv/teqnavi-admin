import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useParams, Link } from '@remix-run/react';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  BlockStack,
  Box,
  Banner,
  Select
} from '@shopify/polaris';
import { authenticate } from "~/shopify.server.js";

interface LoaderData {
  host: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const host = url.searchParams.get("host")!;

  return json<LoaderData>({ host });
}

export default function RulesRoute() {
  const { provider } = useParams();
  const { host } = useLoaderData<typeof loader>();

  return (
    <Page
      title={`${provider?.charAt(0).toUpperCase()}${provider?.slice(1)} Integration - Sync Rules`}
      backAction={{ content: 'Back to Integration', url: `/app/integrations/${provider}?host=${host}` }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="400">
                <Banner>Sync Rules Configuration</Banner>
                <FormLayout>
                  <Select
                    label="Sync Direction"
                    options={[
                      {label: 'Shopify to Exigo', value: 'shopify_to_exigo'},
                      {label: 'Exigo to Shopify', value: 'exigo_to_shopify'},
                      {label: 'Bidirectional', value: 'bidirectional'}
                    ]}
                    onChange={() => {}}
                    value="shopify_to_exigo"
                  />
                  <Select
                    label="Sync Frequency"
                    options={[
                      {label: 'Real-time', value: 'realtime'},
                      {label: 'Hourly', value: 'hourly'},
                      {label: 'Daily', value: 'daily'}
                    ]}
                    onChange={() => {}}
                    value="realtime"
                  />
                  <Button>Save Rules</Button>
                </FormLayout>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 