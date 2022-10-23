import type { FC } from 'react';
import { useEffect } from 'react';
import { Route, useLocation, useRouteMatch } from 'react-router';
import { Switch } from 'react-router-dom';

import { trackEvent1 } from 'new/utils/analytics';

import { ReceiveToken } from './ReceiveToken';
import { SupportedTokens } from './SupportedTokens';

export const Receive: FC = () => {
  const location = useLocation<{ fromPage?: string }>();

  useEffect(() => {
    if (!location.state.fromPage) {
      return;
    }

    if (location.pathname !== location.state.fromPage) {
      trackEvent1({
        name: 'Receive_Start_Screen',
        params: { Last_Screen: location.state.fromPage },
      });
    }
  }, []);

  const match = useRouteMatch();

  return (
    <Switch>
      <Route path={`${match.path}/tokens`}>
        <SupportedTokens />
      </Route>
      <Route path={match.path} exact>
        <ReceiveToken />
      </Route>
    </Switch>
  );
};
