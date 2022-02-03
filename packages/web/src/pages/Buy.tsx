import type { FunctionComponent } from 'react';

import { BuyStateProvider, MoonpayProvider } from 'app/contexts';
import { Layout } from 'components/common/Layout';
import { BuyWidget } from 'components/pages/buy';

export const Buy: FunctionComponent = () => {
  return (
    <MoonpayProvider>
      <BuyStateProvider>
        <Layout>
          <BuyWidget />
        </Layout>
      </BuyStateProvider>
    </MoonpayProvider>
  );
};
