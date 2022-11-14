import type { FC } from 'react';
import { Route } from 'react-router';
import { Routes } from 'react-router-dom';

import { useTrackOpenPageAction } from 'new/sdk/Analytics';

import { ReceiveToken } from './ReceiveToken';
import { SupportedTokens } from './SupportedTokens';

export const Receive: FC = () => {
  useTrackOpenPageAction('Receive_Start_Screen');

  return (
    <Routes>
      <Route path={`/tokens`}>
        <SupportedTokens />
      </Route>
      <Route>
        <ReceiveToken />
      </Route>
    </Routes>
  );
};
