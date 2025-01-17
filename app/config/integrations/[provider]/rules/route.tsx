import { json } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import {
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  Button,
  ButtonGroup
} from '@shopify/polaris';
import type { SyncRule } from '~/integrations/core/types.js';

interface LoaderData {
  rules: SyncRule[];
}

export async function loader() {
  // TODO: Load rules from database
  const mockRules: LoaderData = {
    rules: [
      {
        id: '1',
        name: 'VIP Customer Rule',
        description: 'Update customer type when order contains VIP product',
        condition: {
          field: 'line_items.product_id',
          operator: 'in',
          value: ['VIP_PRODUCT_ID']
        },
        actions: [
          {
            id: '1',
            type: 'updateField',
            target: {
              entity: 'customer',
              field: 'customerType'
            },
            value: 2
          }
        ],
        isEnabled: true,
        priority: 1
      }
    ]
  };

  return json(mockRules);
}

export default function RulesRoute() {
  const { provider } = useParams();
  const { rules } = useLoaderData<typeof loader>();

  return (
    <Page
      title="Sync Rules"
      primaryAction={
        <Button
          variant="primary"
          url={`/app/config/integrations/${provider}/rules/new`}
        >
          Add Rule
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList
              resourceName={{ singular: 'rule', plural: 'rules' }}
              items={rules}
              renderItem={(rule: SyncRule) => (
                <ResourceItem
                  id={rule.id}
                  url={`/app/config/integrations/${provider}/rules/${rule.id}`}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <Text variant="bodyMd" as="h3" fontWeight="bold">
                          {rule.name}
                        </Text>
                        <div style={{ marginTop: '0.25rem' }}>
                          <Text variant="bodySm" as="p">
                            {rule.description}
                          </Text>
                        </div>
                      </div>
                      <ButtonGroup>
                        <Badge tone={rule.isEnabled ? 'success' : 'critical'}>
                          {rule.isEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </ButtonGroup>
                    </div>
                    <div style={{ marginTop: '0.75rem' }}>
                      <Text variant="bodySm" as="p">
                        When {rule.condition.field} {rule.condition.operator} {' '}
                        {Array.isArray(rule.condition.value) 
                          ? rule.condition.value.join(', ') 
                          : rule.condition.value}
                      </Text>
                      <Text variant="bodySm" as="p">
                        Actions: {rule.actions.length}
                      </Text>
                    </div>
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