import type { FC } from 'react';
import { Route, Routes } from 'react-router-dom';

import { useTrackOpenPageAction } from 'new/sdk/Analytics';

import { ReceiveToken } from './ReceiveToken';
import { SupportedTokens } from './SupportedTokens';

export const Receive: FC = () => {
  useTrackOpenPageAction('Receive_Start_Screen');

  return (
    <Routes>
      <Route index element={<ReceiveToken />} />
      <Route path="tokens" element={<SupportedTokens />} />
    </Routes>
  );
};
