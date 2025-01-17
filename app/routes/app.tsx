import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError, useLocation } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { Frame, Navigation } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { Suspense, useEffect } from "react";
import { SettingsIcon, TransferOutIcon } from '@shopify/polaris-icons';

import { authenticate } from "../shopify.server.js";

export const links = () => [
  { rel: "stylesheet", href: polarisStyles }
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  return { 
    apiKey: process.env.SHOPIFY_API_KEY || "",
    host: new URL(request.url).searchParams.get("host")!
  };
};

export default function App() {
  const { apiKey, host } = useLoaderData<typeof loader>();
  const location = useLocation();

  useEffect(() => {
    // Add styles to the head
    const style = document.createElement('style');
    style.textContent = `
      .Polaris-Navigation__Item--subItem {
        padding-left: 25px !important;
      }
    `;
    document.head.appendChild(style);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const navigationMarkup = (
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={[
          {
            label: "Dashboard",
            url: `/app?host=${host}`,
            selected: location.pathname === "/app",
          },
          {
            label: "Flow Editor",
            url: `/app/flows?host=${host}`,
            selected: location.pathname.startsWith("/app/flows"),
          },
          {
            label: "Theme Editor",
            url: `/app/theme?host=${host}`,
            selected: location.pathname.startsWith("/app/theme"),
            subNavigationItems: [
              {
                label: "Page Builder",
                url: `/app/theme/customize?host=${host}`
              },
              {
                label: "Code Editor",
                url: `/app/theme/assets?host=${host}`
              }
            ]
          },
          {
            label: 'Integrations',
            url: `/app/integrations?host=${host}`,
            selected: location.pathname.startsWith("/app/integrations"),
            icon: TransferOutIcon,
          },
          {
            label: 'Settings',
            url: `/app/settings?host=${host}`,
            icon: SettingsIcon,
          }
        ]}
      />
    </Navigation>
  );

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <Frame navigation={navigationMarkup}>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </Frame>
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
