import { Page, Layout, Card, DataTable, Badge } from "@shopify/polaris";
import { authenticate } from "../shopify.server.js";
import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Fetch orders using GraphQL
  const response = await admin.graphql(`
    query {
      orders(first: 10) {
        edges {
          node {
            id
            name
            displayFinancialStatus
            displayFulfillmentStatus
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            customer {
              displayName
            }
            createdAt
          }
        }
      }
    }
  `);

  const responseJson = await response.json();
  const orders = responseJson.data.orders.edges.map(({ node }: any) => [
    node.name,
    node.customer?.displayName || 'No customer',
    <Badge tone={getFinancialStatusColor(node.displayFinancialStatus)}>
      {node.displayFinancialStatus}
    </Badge>,
    <Badge tone={getFulfillmentStatusColor(node.displayFulfillmentStatus)}>
      {node.displayFulfillmentStatus}
    </Badge>,
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: node.totalPriceSet.shopMoney.currencyCode
    }).format(node.totalPriceSet.shopMoney.amount),
    new Date(node.createdAt).toLocaleDateString()
  ]);

  return json({ orders });
};

function getFinancialStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'paid': return 'success';
    case 'pending': return 'warning';
    case 'refunded': return 'info';
    default: return 'critical';
  }
}

function getFulfillmentStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'fulfilled': return 'success';
    case 'in progress': return 'warning';
    case 'partial': return 'info';
    default: return 'attention';
  }
}

export default function Orders() {
  const { orders } = useLoaderData<typeof loader>();

  return (
    <Page title="Orders">
      <Layout>
        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={[
                'text',
                'text',
                'text',
                'text',
                'numeric',
                'text',
              ]}
              headings={[
                'Order',
                'Customer',
                'Payment',
                'Fulfillment',
                'Total',
                'Date',
              ]}
              rows={orders}
              footerContent={`Showing ${orders.length} of ${orders.length} orders`}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 