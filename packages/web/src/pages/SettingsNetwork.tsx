import type { FunctionComponent } from 'react';
import { useLocation } from 'react-router-dom';

import { Layout } from 'components/common/Layout';
import { Network } from 'components/pages/settings/Network';

export const SettingsNetwork: FunctionComponent = () => {
  const location = useLocation();

  return (
    <Layout
      breadcrumb={{
        currentName: 'Network',
        backTo: { pathname: '/settings', state: { fromPage: location.pathname } },
      }}
    >
      <Network />
    </Layout>
  );
};
