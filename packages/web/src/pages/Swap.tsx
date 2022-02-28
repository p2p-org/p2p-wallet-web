import type { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';

import { FeeCompensationProvider } from 'app/contexts';
import { SwapProvider } from 'app/contexts/solana/swap';
import { useTrackEventOpen } from 'app/hooks/metrics';
import { Layout } from 'components/common/Layout';
import { SwapWidget } from 'components/pages/swap/SwapWidget';

export const Swap: FunctionComponent = () => {
  useTrackEventOpen('Swap_Viewed');

  const { symbol } = useParams<{ symbol?: string }>();

  return (
    <Layout>
      <FeeCompensationProvider>
        <SwapProvider initialState={{ inputTokenName: symbol }}>
          <SwapWidget />
        </SwapProvider>
      </FeeCompensationProvider>
    </Layout>
  );
};
