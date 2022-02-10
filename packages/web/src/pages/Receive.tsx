import type { FunctionComponent } from 'react';
import { useEffect } from 'react';
import { Route, useRouteMatch } from 'react-router';
import { Switch, useLocation } from 'react-router-dom';

import { ReceiveStateProvider } from 'app/contexts';
import { Layout } from 'components/common/Layout';
import { ReceiveTokensWidget, ReceiveWidget } from 'components/pages/receive';
import { trackEvent } from 'utils/analytics';

export const Receive: FunctionComponent = () => {
  const match = useRouteMatch();
  const location = useLocation<{ fromPage: string }>();

  useEffect(() => {
    trackEvent('receive_open', { fromPage: location.state.fromPage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ReceiveStateProvider>
      <Layout>
        <Switch>
          <Route path={`${match.path}/tokens`}>
            <ReceiveTokensWidget />
          </Route>
          <Route path={match.path} exact>
            <ReceiveWidget />
          </Route>
        </Switch>
      </Layout>
    </ReceiveStateProvider>
  );
};
