import { Outlet, useMatches, useLocation } from '@remix-run/react';
import { Tabs } from '@shopify/polaris';

export default function IntegrationsLayout() {
  const matches = useMatches();
  const location = useLocation();
  const provider = matches.find(match => match.params.provider)?.params.provider;
  
  if (!provider) {
    return <Outlet />;
  }

  const currentPath = location.pathname;
  const selectedTab = currentPath.includes('/mappings') ? 1 
    : currentPath.includes('/rules') ? 2 
    : 0;

  return (
    <div>
      <Tabs
        selected={selectedTab}
        tabs={[
          {
            id: 'overview',
            content: 'Overview',
            url: `/app/config/integrations/${provider}`
          },
          {
            id: 'mappings',
            content: 'Field Mappings',
            url: `/app/config/integrations/${provider}/mappings`
          },
          {
            id: 'rules',
            content: 'Sync Rules',
            url: `/app/config/integrations/${provider}/rules`
          }
        ]}
      />
      <div style={{ marginTop: '1rem' }}>
        <Outlet />
      </div>
    </div>
  );
} 