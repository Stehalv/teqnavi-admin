import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { Frame } from "@shopify/polaris";
import { AppProvider as PolarisProvider } from '@shopify/polaris';
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import polarisTranslations from '@shopify/polaris/locales/en.json';
import { Suspense } from "react";

import { authenticate } from "../shopify.server.js";

export const links = () => [
  { rel: "stylesheet", href: polarisStyles }
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  return { 
    apiKey: process.env.SHOPIFY_API_KEY || "",
    host: url.searchParams.get("host")!
  };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <PolarisProvider i18n={polarisTranslations}>
        <ui-nav-menu>
          <a href="/app">Dashboard</a>
          <a href="/app/flows">Flow Editor</a>
          <a href="/app/pagebuilder">Pagebuilder</a>
          <a href="/app/integrations">Integrations</a>
          <a href="/app/settings">Settings</a>
        </ui-nav-menu>
        <Frame>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </Frame>
      </PolarisProvider>
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
