import type { FC } from 'react';
import { Route, useRouteMatch } from 'react-router';
import { Switch } from 'react-router-dom';

import { ReceiveToken } from 'new/scenes/Main/Receive/ReceiveToken';
import { SupportedTokens } from 'new/scenes/Main/Receive/SupportedTokens';

export const Receive: FC = () => {
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
