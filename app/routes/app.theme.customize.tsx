import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, Outlet, useLocation } from "@remix-run/react";
import { Page, Layout, Card, ResourceList, Button, Text, EmptyState } from "@shopify/polaris";
import { authenticate } from "~/shopify.server.js";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const host = url.searchParams.get("host")!;
  
  // Import prisma only in the loader
  const { prisma } = await import("~/db.server.js");
  
  const pages = await prisma.themeAsset.findMany({
    where: { 
      type: 'page'
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return json({ pages, host });
}

export default function ThemeCustomize() {
  const { pages, host } = useLoaderData<typeof loader>();
  const location = useLocation();
  
  // If we're on a specific page route, render the Outlet
  if (location.pathname !== "/app/theme/customize") {
    return <Outlet />;
  }
  
  if (pages.length === 0) {
    return (
      <Page>
        <Layout>
          <Layout.Section>
            <EmptyState
              heading="No pages available"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              action={{
                content: 'Create a page',
                url: `/app/theme/assets?host=${host}`
              }}
            >
              <p>Create a page in the asset editor to start customizing your theme.</p>
            </EmptyState>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Theme Pages"
      primaryAction={{
        content: 'Create page',
        url: `/app/theme/assets?host=${host}`
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList
              items={pages}
              renderItem={(page) => (
                <ResourceList.Item
                  id={page.id}
                  url={`/app/theme/customize/${page.id}?host=${host}`}
                  accessibilityLabel={`Edit ${page.name}`}
                >
                  <div style={{ padding: '1rem' }}>
                    <Text as="h3" variant="bodyMd" fontWeight="bold">
                      {page.name}
                    </Text>
                    <Text as="p" variant="bodyMd" tone={page.isActive ? "success" : "critical"}>
                      {page.isActive ? "Active" : "Draft"}
                    </Text>
                  </div>
                </ResourceList.Item>
              )}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 