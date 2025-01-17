import { json } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import { useState } from 'react';
import {
  Page,
  Layout,
  Card,
  Tabs,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  Button,
  ButtonGroup
} from '@shopify/polaris';
import type { FieldMapping } from '~/integrations/core/types.js';

interface LoaderData {
  mappings: {
    customers: FieldMapping[];
    orders: FieldMapping[];
    products: FieldMapping[];
  };
}

export async function loader() {
  // TODO: Load mappings from database
  const mockMappings: LoaderData = {
    mappings: {
      customers: [
        {
          id: '1',
          sourceField: 'first_name',
          targetField: 'firstName',
          isEnabled: true
        }
      ],
      orders: [],
      products: []
    }
  };

  return json(mockMappings);
}

export default function MappingsRoute() {
  const { provider } = useParams();
  const { mappings } = useLoaderData<typeof loader>();
  const [selectedTab, setSelectedTab] = useState('customers');

  const tabs = [
    { id: 'customers', content: 'Customers' },
    { id: 'orders', content: 'Orders' },
    { id: 'products', content: 'Products' }
  ];

  const currentMappings = mappings[selectedTab as keyof typeof mappings] || [];

  return (
    <Page
      title="Field Mappings"
      primaryAction={
        <Button
          variant="primary"
          url={`/app/config/integrations/${provider}/mappings/new?type=${selectedTab}`}
        >
          Add Mapping
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Tabs
              tabs={tabs}
              selected={tabs.findIndex(tab => tab.id === selectedTab)}
              onSelect={index => setSelectedTab(tabs[index].id)}
            />
            <ResourceList
              resourceName={{ singular: 'mapping', plural: 'mappings' }}
              items={currentMappings}
              renderItem={(item: FieldMapping) => (
                <ResourceItem
                  id={item.id}
                  url={`/app/config/integrations/${provider}/mappings/${item.id}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <Text variant="bodyMd" as="h3" fontWeight="bold">
                        {item.sourceField} → {item.targetField}
                      </Text>
                      {item.transform && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <Text variant="bodySm" as="p">
                            Transform: {item.transform}
                          </Text>
                        </div>
                      )}
                    </div>
                    <ButtonGroup>
                      <Badge tone={item.isEnabled ? 'success' : 'critical'}>
                        {item.isEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </ButtonGroup>
                  </div>
                </ResourceItem>
              )}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 