import type { FunctionComponent } from 'react';
import { Route, useRouteMatch } from 'react-router';
import { Switch } from 'react-router-dom';

import { ReceiveStateProvider } from 'app/contexts';
import { useTrackEventOpen } from 'app/hooks/metrics';
import { Layout } from 'components/common/Layout';
import { ReceiveTokensWidget, ReceiveWidget } from 'components/pages/receive';

export const Receive: FunctionComponent = () => {
  useTrackEventOpen('Receive_Viewed');

  const match = useRouteMatch();

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
