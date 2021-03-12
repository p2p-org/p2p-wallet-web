import React, { FunctionComponent } from 'react';

import { Layout } from 'components/common/Layout';
import { Network } from 'components/pages/settings/Network';

export const SettingsNetwork: FunctionComponent = () => {
  return (
    <Layout
      breadcrumb={{
        currentName: 'Network',
        backTo: '/settings',
      }}
      rightColumn={<Network />}
    />
  );
};
