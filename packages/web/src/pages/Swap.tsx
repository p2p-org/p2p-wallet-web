import type { FunctionComponent } from 'react';
import { Route, Switch, useParams } from 'react-router-dom';

import { FeeCompensationProvider } from 'app/contexts';
import { SwapProvider } from 'app/contexts/solana/swap';
import { useTrackEventOpen } from 'app/hooks/metrics';
import { Layout } from 'components/common/Layout';
import { SwapSlippageWidget } from 'components/pages/swap/SwapSlippageWidget';
import { SwapWidget } from 'components/pages/swap/SwapWidget';

export const Swap: FunctionComponent = () => {
  useTrackEventOpen('Swap_Viewed');

  const { symbol } = useParams<{ symbol?: string }>();

  return (
    <Layout>
      <FeeCompensationProvider>
        <SwapProvider initialState={{ inputTokenName: symbol }}>
          <Switch>
            <Route path={`/swap/settings/:symbol?`}>
              <SwapSlippageWidget />
            </Route>
            <Route path={'/swap/:symbol?'}>
              <SwapWidget />
            </Route>
          </Switch>
        </SwapProvider>
      </FeeCompensationProvider>
    </Layout>
  );
};
