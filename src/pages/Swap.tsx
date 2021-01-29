import React, { FunctionComponent } from 'react';

import { Layout } from 'components/common/Layout';
import { SwapWidget } from 'components/pages/swap/SwapWidget';

export const Swap: FunctionComponent = () => {
  // const breadcrumbs = [{ name: 'Wallets', to: '/wallets' }, { name: 'Swap ' }];

  return (
    <Layout
      // breadcrumbs={breadcrumbs}
      rightColumn={<SwapWidget />}
    />
  );
};
