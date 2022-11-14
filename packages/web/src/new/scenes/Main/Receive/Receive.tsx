import type { FC } from 'react';
import { Route, useRouteMatch } from 'react-router';
import { Routes } from 'react-router-dom';

import { useTrackOpenPageAction } from 'new/sdk/Analytics';

import { ReceiveToken } from './ReceiveToken';
import { SupportedTokens } from './SupportedTokens';

export const Receive: FC = () => {
  useTrackOpenPageAction('Receive_Start_Screen');

  const match = useRouteMatch();

  return (
    <Routes>
      <Route path={`${match.path}/tokens`}>
        <SupportedTokens />
      </Route>
      <Route path={match.path}>
        <ReceiveToken />
      </Route>
    </Routes>
  );
};
