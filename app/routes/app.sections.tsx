import { Page, Layout } from "@shopify/polaris";
import { Outlet } from "@remix-run/react";

export default function Sections() {
  return (
    <Page title="Sections">
      <Layout>
        <Layout.Section>
          <Outlet />
        </Layout.Section>
      </Layout>
    </Page>
  );
} 