import type { FunctionComponent } from 'react';
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { FeeCompensationProvider } from 'app/contexts';
import { SwapProvider } from 'app/contexts/solana/swap';
import { Layout } from 'components/common/Layout';
import { SwapWidget } from 'components/pages/swap/SwapWidget';
import { trackEvent } from 'utils/analytics';

export const Swap: FunctionComponent = () => {
  const location = useLocation<{ fromPage: string }>();
  const { symbol } = useParams<{ symbol?: string }>();

  useEffect(() => {
    trackEvent('swap_open', { fromPage: location.state.fromPage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
