import { Outlet } from '@remix-run/react';
import { Frame, Navigation } from '@shopify/polaris';
import { SettingsIcon, TransferOutIcon } from '@shopify/polaris-icons';

export default function ConfigLayout() {
  return (
    <Frame>
      <div style={{ display: 'flex', height: '100%' }}>
        <Navigation location="/">
          <Navigation.Section
            items={[
              {
                label: 'Integrations',
                icon: TransferOutIcon,
                url: '/app/config/integrations'
              },
              {
                label: 'Settings',
                icon: SettingsIcon,
                url: '/app/config/settings'
              }
            ]}
          />
        </Navigation>
        <div style={{ flex: 1, padding: '1rem' }}>
          <Outlet />
        </div>
      </div>
    </Frame>
  );
} 