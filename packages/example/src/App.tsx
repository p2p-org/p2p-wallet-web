import type { FC } from 'react';
import React from 'react';

import { RatesProvider, SolanaProvider, TokenAccountsProvider } from '@p2p-wallet-web/core';
import { SailProvider } from '@p2p-wallet-web/sail';

import { Connect } from './components/Connect';
import { TokenAccountsList } from './components/TokenAccountsList';

const App: FC = () => {
  return (
    <SolanaProvider>
      <SailProvider>
        <TokenAccountsProvider>
          <RatesProvider>
            <Connect />
            <TokenAccountsList />
          </RatesProvider>
        </TokenAccountsProvider>
      </SailProvider>
    </SolanaProvider>
  );
};

export default App;
