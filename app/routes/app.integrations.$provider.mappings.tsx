import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  Button,
  BlockStack,
  Box,
  Banner,
  Tabs,
  Select,
  TextField,
  Icon,
  InlineStack,
  Text,
  Modal,
  ChoiceList,
  ButtonGroup
} from '@shopify/polaris';
import { DeleteIcon, PlusIcon } from '@shopify/polaris-icons';
import { authenticate } from "~/shopify.server.js";
import { useState } from 'react';

interface MappingRule {
  id: string;
  name: string;
  sourceType: 'shopify_order' | 'shopify_customer' | 'shopify_order_attribute' | 'shopify_line_item' | 'shopify_line_item_property';
  sourceField: string;
  targetType: 'exigo_order' | 'exigo_customer' | 'exigo_customersites';
  targetField: string;
  condition?: {
    field: string;
    operator: 'equals' | 'contains' | 'exists' | 'not_exists' | 'in';
    value?: string | string[];
    sourceType?: 'shopify_order' | 'shopify_customer' | 'shopify_order_attribute' | 'shopify_line_item' | 'shopify_line_item_property';
  };
  transformation?: {
    type: 'lookup' | 'direct' | 'conditional';
    lookupType?: 'sql' | 'api';
    lookupTable?: string;
    lookupField?: string;
    returnField?: string;
    apiEndpoint?: string;
    conditions?: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'exists' | 'not_exists' | 'in';
      value: string | string[];
      sourceType?: 'shopify_order' | 'shopify_customer' | 'shopify_order_attribute' | 'shopify_line_item' | 'shopify_line_item_property';
      then: string;
    }>;
    defaultValue?: string;
  };
}

interface LoaderData {
  host: string;
  mappingRules: MappingRule[];
  availableFields: {
    shopify: {
      order: string[];
      customer: string[];
      orderAttributes: string[];
      lineItem: string[];
      lineItemProperties: string[];
    };
    exigo: {
      order: string[];
      customer: string[];
      customerSites: string[];
    };
  };
  availableEndpoints: Array<{
    id: string;
    name: string;
    description: string;
    returnType: string;
  }>;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const host = url.searchParams.get("host")!;

  // In a real implementation, these would come from your database or API
  const availableFields = {
    shopify: {
      order: ['id', 'note', 'total_price', 'created_at', 'tags', 'gateway'],
      customer: ['id', 'email', 'first_name', 'last_name', 'tags'],
      orderAttributes: ['referral', 'sponsor'],
      lineItem: ['product_id', 'sku', 'quantity', 'price', 'title', 'variant_id'],
      lineItemProperties: ['_type', 'category', 'subscription_type']
    },
    exigo: {
      order: ['OrderID', 'CustomerID', 'OrderDate', 'OrderStatusID', 'OrderTypeID'],
      customer: ['CustomerID', 'FirstName', 'LastName', 'EnrollerID', 'CustomerTypeID', 'CustomerStatusID'],
      customerSites: ['CustomerID', 'WebAlias']
    }
  };

  // Example available API endpoints
  const availableEndpoints = [
    {
      id: 'get_customer_by_webalias',
      name: 'Get Customer by WebAlias',
      description: 'Looks up a customer by their web alias',
      returnType: 'CustomerID'
    },
    {
      id: 'get_customer_by_email',
      name: 'Get Customer by Email',
      description: 'Looks up a customer by their email address',
      returnType: 'CustomerID'
    }
  ];

  // Example mapping rules
  const mappingRules: MappingRule[] = [
    {
      id: '1',
      name: 'Referral to EnrollerID',
      sourceType: 'shopify_order_attribute',
      sourceField: 'referral',
      targetType: 'exigo_customer',
      targetField: 'EnrollerID',
      transformation: {
        type: 'lookup',
        lookupType: 'api',
        apiEndpoint: 'get_customer_by_webalias'
      }
    }
  ];

  return json<LoaderData>({ host, mappingRules, availableFields, availableEndpoints });
}

export default function MappingsRoute() {
  const { provider } = useParams();
  const { host, mappingRules: initialRules, availableFields, availableEndpoints } = useLoaderData<typeof loader>();
  const [selectedTab, setSelectedTab] = useState(0);
  const [mappingRules, setMappingRules] = useState<MappingRule[]>(initialRules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<Partial<MappingRule>>({});

  const tabs = [
    {
      id: 'customer',
      content: 'Customer Mappings',
      panelID: 'customer-panel',
    },
    {
      id: 'order',
      content: 'Order Mappings',
      panelID: 'order-panel',
    }
  ];

  const handleAddRule = () => {
    setCurrentRule({});
    setIsModalOpen(true);
  };

  const handleSaveRule = () => {
    if (currentRule.id) {
      setMappingRules(rules => rules.map(r => r.id === currentRule.id ? currentRule as MappingRule : r));
    } else {
      setMappingRules(rules => [...rules, { ...currentRule, id: Date.now().toString() } as MappingRule]);
    }
    setIsModalOpen(false);
  };

  const handleEditRule = (rule: MappingRule) => {
    setCurrentRule(rule);
    setIsModalOpen(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    setMappingRules(rules => rules.filter(r => r.id !== ruleId));
  };

  return (
    <Page
      title={`${provider?.charAt(0).toUpperCase()}${provider?.slice(1)} Integration - Field Mappings`}
      backAction={{ content: 'Back to Integration', url: `/app/integrations/${provider}?host=${host}` }}
      primaryAction={{
        content: 'Add Mapping Rule',
        onAction: handleAddRule
      }}
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
              <BlockStack gap="400">
                {mappingRules.map(rule => (
                  <Card key={rule.id}>
                    <Box padding="400">
                      <BlockStack gap="400">
                        <InlineStack align="space-between">
                          <Text variant="headingMd" as="h3">{rule.name}</Text>
                          <ButtonGroup>
                            <Button onClick={() => handleEditRule(rule)}>Edit</Button>
                            <Button 
                              tone="critical"
                              onClick={() => handleDeleteRule(rule.id)}
                              icon={DeleteIcon}
                            />
                          </ButtonGroup>
                        </InlineStack>
                        <BlockStack gap="200">
                          <Text as="p">Source: {rule.sourceType}.{rule.sourceField}</Text>
                          <Text as="p">Target: {rule.targetType}.{rule.targetField}</Text>
                          {rule.transformation && (
                            <Text as="p">
                              Transformation: {rule.transformation.type}
                              {rule.transformation.type === 'lookup' && rule.transformation.lookupType === 'sql' && 
                                ` (SQL: ${rule.transformation.lookupTable}.${rule.transformation.lookupField} → ${rule.transformation.returnField})`
                              }
                              {rule.transformation.type === 'lookup' && rule.transformation.lookupType === 'api' && 
                                ` (API: ${availableEndpoints.find(e => e.id === rule.transformation?.apiEndpoint)?.name || rule.transformation.apiEndpoint})`
                              }
                            </Text>
                          )}
                        </BlockStack>
                      </BlockStack>
                    </Box>
                  </Card>
                ))}
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentRule.id ? "Edit Mapping Rule" : "New Mapping Rule"}
        primaryAction={{
          content: "Save",
          onAction: handleSaveRule
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setIsModalOpen(false)
          }
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Rule Name"
              value={currentRule.name || ''}
              onChange={(value) => setCurrentRule(r => ({ ...r, name: value }))}
              autoComplete="off"
            />
            <Select
              label="Source Type"
              options={[
                { label: 'Shopify Order', value: 'shopify_order' },
                { label: 'Shopify Customer', value: 'shopify_customer' },
                { label: 'Shopify Order Attribute', value: 'shopify_order_attribute' },
                { label: 'Shopify Line Item', value: 'shopify_line_item' },
                { label: 'Shopify Line Item Property', value: 'shopify_line_item_property' }
              ]}
              value={currentRule.sourceType || ''}
              onChange={(value) => setCurrentRule(r => ({ ...r, sourceType: value as MappingRule['sourceType'] }))}
            />
            <Select
              label="Source Field"
              options={
                currentRule.sourceType === 'shopify_order' ? availableFields.shopify.order.map(f => ({ label: f, value: f })) :
                currentRule.sourceType === 'shopify_customer' ? availableFields.shopify.customer.map(f => ({ label: f, value: f })) :
                currentRule.sourceType === 'shopify_order_attribute' ? availableFields.shopify.orderAttributes.map(f => ({ label: f, value: f })) :
                currentRule.sourceType === 'shopify_line_item' ? availableFields.shopify.lineItem.map(f => ({ label: f, value: f })) :
                currentRule.sourceType === 'shopify_line_item_property' ? availableFields.shopify.lineItemProperties.map(f => ({ label: f, value: f })) :
                []
              }
              value={currentRule.sourceField || ''}
              onChange={(value) => setCurrentRule(r => ({ ...r, sourceField: value }))}
            />
            <Select
              label="Target Type"
              options={[
                { label: 'Exigo Order', value: 'exigo_order' },
                { label: 'Exigo Customer', value: 'exigo_customer' },
                { label: 'Exigo Customer Sites', value: 'exigo_customersites' }
              ]}
              value={currentRule.targetType || ''}
              onChange={(value) => setCurrentRule(r => ({ ...r, targetType: value as MappingRule['targetType'] }))}
            />
            <Select
              label="Target Field"
              options={
                currentRule.targetType === 'exigo_order' ? availableFields.exigo.order.map(f => ({ label: f, value: f })) :
                currentRule.targetType === 'exigo_customer' ? availableFields.exigo.customer.map(f => ({ label: f, value: f })) :
                currentRule.targetType === 'exigo_customersites' ? availableFields.exigo.customerSites.map(f => ({ label: f, value: f })) :
                []
              }
              value={currentRule.targetField || ''}
              onChange={(value) => setCurrentRule(r => ({ ...r, targetField: value }))}
            />
            <Select
              label="Transformation Type"
              options={[
                { label: 'Direct Mapping', value: 'direct' },
                { label: 'Lookup', value: 'lookup' },
                { label: 'Conditional', value: 'conditional' }
              ]}
              value={currentRule.transformation?.type || 'direct'}
              onChange={(value) => setCurrentRule(r => ({ 
                ...r, 
                transformation: { 
                  type: value as MappingRule['transformation']['type'],
                  ...(value === 'lookup' ? { lookupType: 'sql' } : {})
                }
              }))}
            />
            {currentRule.transformation?.type === 'lookup' && (
              <>
                <Select
                  label="Lookup Type"
                  options={[
                    { label: 'SQL Query', value: 'sql' },
                    { label: 'API Endpoint', value: 'api' }
                  ]}
                  value={currentRule.transformation.lookupType || 'sql'}
                  onChange={(value) => setCurrentRule(r => ({
                    ...r,
                    transformation: {
                      ...r.transformation,
                      lookupType: value as 'sql' | 'api',
                      // Clear the fields when switching types
                      lookupTable: undefined,
                      lookupField: undefined,
                      returnField: undefined,
                      apiEndpoint: undefined
                    }
                  }))}
                />
                {currentRule.transformation.lookupType === 'sql' && (
                  <>
                    <Select
                      label="Lookup Table"
                      options={[
                        { label: 'Customer Sites', value: 'customersites' }
                      ]}
                      value={currentRule.transformation.lookupTable || ''}
                      onChange={(value) => setCurrentRule(r => ({
                        ...r,
                        transformation: {
                          ...r.transformation,
                          lookupTable: value
                        }
                      }))}
                    />
                    <Select
                      label="Lookup Field"
                      options={[
                        { label: 'Web Alias', value: 'WebAlias' }
                      ]}
                      value={currentRule.transformation.lookupField || ''}
                      onChange={(value) => setCurrentRule(r => ({
                        ...r,
                        transformation: {
                          ...r.transformation,
                          lookupField: value
                        }
                      }))}
                    />
                    <Select
                      label="Return Field"
                      options={[
                        { label: 'Customer ID', value: 'CustomerID' }
                      ]}
                      value={currentRule.transformation.returnField || ''}
                      onChange={(value) => setCurrentRule(r => ({
                        ...r,
                        transformation: {
                          ...r.transformation,
                          returnField: value
                        }
                      }))}
                    />
                  </>
                )}
                {currentRule.transformation.lookupType === 'api' && (
                  <>
                    <Select
                      label="API Endpoint"
                      options={availableEndpoints.map(endpoint => ({
                        label: endpoint.name,
                        value: endpoint.id,
                        helpText: endpoint.description
                      }))}
                      value={currentRule.transformation.apiEndpoint || ''}
                      onChange={(value) => setCurrentRule(r => ({
                        ...r,
                        transformation: {
                          ...r.transformation,
                          apiEndpoint: value
                        }
                      }))}
                    />
                  </>
                )}
              </>
            )}
            {currentRule.transformation?.type === 'conditional' && (
              <>
                <Card>
                  <Box padding="400">
                    <BlockStack gap="400">
                      <InlineStack align="space-between">
                        <Text variant="headingMd" as="h3">Conditions</Text>
                        <Button
                          onClick={() => {
                            setCurrentRule(r => ({
                              ...r,
                              transformation: {
                                ...r.transformation,
                                conditions: [
                                  ...(r.transformation?.conditions || []),
                                  {
                                    field: '',
                                    operator: 'equals',
                                    value: '',
                                    then: ''
                                  }
                                ]
                              }
                            }));
                          }}
                        >
                          Add Condition
                        </Button>
                      </InlineStack>
                      {currentRule.transformation.conditions?.map((condition, index) => (
                        <Card key={index}>
                          <Box padding="400">
                            <BlockStack gap="400">
                              <Select
                                label="Source Type"
                                options={[
                                  { label: 'Shopify Order', value: 'shopify_order' },
                                  { label: 'Shopify Customer', value: 'shopify_customer' },
                                  { label: 'Shopify Order Attribute', value: 'shopify_order_attribute' },
                                  { label: 'Shopify Line Item', value: 'shopify_line_item' },
                                  { label: 'Shopify Line Item Property', value: 'shopify_line_item_property' }
                                ]}
                                value={condition.sourceType || ''}
                                onChange={(value) => {
                                  setCurrentRule(r => {
                                    const conditions = [...(r.transformation?.conditions || [])];
                                    conditions[index] = {
                                      ...conditions[index],
                                      sourceType: value as MappingRule['sourceType']
                                    };
                                    return {
                                      ...r,
                                      transformation: {
                                        ...r.transformation,
                                        conditions
                                      }
                                    };
                                  });
                                }}
                              />
                              <Select
                                label="Field"
                                options={
                                  condition.sourceType === 'shopify_order' ? availableFields.shopify.order.map(f => ({ label: f, value: f })) :
                                  condition.sourceType === 'shopify_customer' ? availableFields.shopify.customer.map(f => ({ label: f, value: f })) :
                                  condition.sourceType === 'shopify_order_attribute' ? availableFields.shopify.orderAttributes.map(f => ({ label: f, value: f })) :
                                  condition.sourceType === 'shopify_line_item' ? availableFields.shopify.lineItem.map(f => ({ label: f, value: f })) :
                                  condition.sourceType === 'shopify_line_item_property' ? availableFields.shopify.lineItemProperties.map(f => ({ label: f, value: f })) :
                                  []
                                }
                                value={condition.field || ''}
                                onChange={(value) => {
                                  setCurrentRule(r => {
                                    const conditions = [...(r.transformation?.conditions || [])];
                                    conditions[index] = {
                                      ...conditions[index],
                                      field: value
                                    };
                                    return {
                                      ...r,
                                      transformation: {
                                        ...r.transformation,
                                        conditions
                                      }
                                    };
                                  });
                                }}
                              />
                              <Select
                                label="Operator"
                                options={[
                                  { label: 'Equals', value: 'equals' },
                                  { label: 'Contains', value: 'contains' },
                                  { label: 'Exists', value: 'exists' },
                                  { label: 'Does Not Exist', value: 'not_exists' },
                                  { label: 'In List', value: 'in' }
                                ]}
                                value={condition.operator || ''}
                                onChange={(value) => {
                                  setCurrentRule(r => {
                                    const conditions = [...(r.transformation?.conditions || [])];
                                    conditions[index] = {
                                      ...conditions[index],
                                      operator: value as MappingRule['condition']['operator']
                                    };
                                    return {
                                      ...r,
                                      transformation: {
                                        ...r.transformation,
                                        conditions
                                      }
                                    };
                                  });
                                }}
                              />
                              {condition.operator !== 'exists' && condition.operator !== 'not_exists' && (
                                <TextField
                                  label="Value"
                                  value={Array.isArray(condition.value) ? condition.value.join(', ') : condition.value || ''}
                                  onChange={(value) => {
                                    setCurrentRule(r => {
                                      const conditions = [...(r.transformation?.conditions || [])];
                                      conditions[index] = {
                                        ...conditions[index],
                                        value: condition.operator === 'in' ? value.split(',').map(v => v.trim()) : value
                                      };
                                      return {
                                        ...r,
                                        transformation: {
                                          ...r.transformation,
                                          conditions
                                        }
                                      };
                                    });
                                  }}
                                  helpText={condition.operator === 'in' ? 'Enter comma-separated values' : undefined}
                                  autoComplete="off"
                                />
                              )}
                              <TextField
                                label="Then Set Value To"
                                value={condition.then || ''}
                                onChange={(value) => {
                                  setCurrentRule(r => {
                                    const conditions = [...(r.transformation?.conditions || [])];
                                    conditions[index] = {
                                      ...conditions[index],
                                      then: value
                                    };
                                    return {
                                      ...r,
                                      transformation: {
                                        ...r.transformation,
                                        conditions
                                      }
                                    };
                                  });
                                }}
                                autoComplete="off"
                              />
                              <Button
                                tone="critical"
                                onClick={() => {
                                  setCurrentRule(r => {
                                    const conditions = [...(r.transformation?.conditions || [])];
                                    conditions.splice(index, 1);
                                    return {
                                      ...r,
                                      transformation: {
                                        ...r.transformation,
                                        conditions
                                      }
                                    };
                                  });
                                }}
                              >
                                Remove Condition
                              </Button>
                            </BlockStack>
                          </Box>
                        </Card>
                      ))}
                    </BlockStack>
                  </Box>
                </Card>
                <TextField
                  label="Default Value"
                  value={currentRule.transformation.defaultValue || ''}
                  onChange={(value) => setCurrentRule(r => ({
                    ...r,
                    transformation: {
                      ...r.transformation,
                      defaultValue: value
                    }
                  }))}
                  helpText="Value to use if no conditions match"
                  autoComplete="off"
                />
              </>
            )}
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
} 