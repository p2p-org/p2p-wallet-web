import type { FC } from 'react';
import { Route, useRouteMatch } from 'react-router';
import { Switch } from 'react-router-dom';

import { useTrackOpenPageAction } from 'new/sdk/Analytics';

import { ReceiveToken } from './ReceiveToken';
import { SupportedTokens } from './SupportedTokens';

export const Receive: FC = () => {
  useTrackOpenPageAction('Receive_Start_Screen');

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
