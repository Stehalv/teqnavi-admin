import { Page, Layout, Card, DataTable, Text, Spinner } from "@shopify/polaris";
import { authenticate } from "../shopify.server.js";
import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Fetch customers using GraphQL
  const response = await admin.graphql(`
    query {
      customers(first: 10) {
        edges {
          node {
            id
            displayName
            email
            phone
            createdAt
          }
        }
      }
    }
  `);

  const responseJson = await response.json();
  const customers = responseJson.data.customers.edges.map(({ node }: any) => [
    node.displayName,
    node.email,
    node.ordersCount,
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
      .format(node.totalSpent),
    new Date(node.createdAt).toLocaleDateString()
  ]);

  return json({ customers });
};

export default function Customers() {
  const { customers } = useLoaderData<typeof loader>();

  return (
    <Page title="Customers">
      <Layout>
        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={[
                'text',
                'text',
                'numeric',
                'numeric',
                'text',
              ]}
              headings={[
                'Name',
                'Email',
                'Orders',
                'Total Spent',
                'Created',
              ]}
              rows={customers}
              footerContent={`Showing ${customers.length} of ${customers.length} customers`}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 