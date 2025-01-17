import { Page, Layout, Card, Text } from "@shopify/polaris";

export default function SyncOverview() {
  return (
    <Page title="Sync Overview">
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="h2" variant="headingMd">
              Sync Overview
            </Text>
            <Text as="p" variant="bodyMd">
              View and manage your sync status here.
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 