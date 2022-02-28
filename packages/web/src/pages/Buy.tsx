import type { FunctionComponent } from 'react';

import { BuyStateProvider, MoonpayProvider } from 'app/contexts';
import { useTrackEventOpen } from 'app/hooks/metrics';
import { Layout } from 'components/common/Layout';
import { BuyWidget } from 'components/pages/buy';

export const Buy: FunctionComponent = () => {
  useTrackEventOpen('Buy_Viewed');

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
