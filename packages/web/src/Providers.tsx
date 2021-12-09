import type { FC } from 'react';
import React, { useEffect, useState } from 'react';

import type { ConnectedWallet } from '@p2p-wallet-web/core';
import {
  NETWORK_CONFIGS,
  RatesProvider,
  SeedProvider,
  SolanaProvider,
  TokenAccountsProvider,
} from '@p2p-wallet-web/core';
import { NameServiceProvider } from '@p2p-wallet-web/core/dist/cjs/contexts/api/nameService';
import { SailProvider } from '@p2p-wallet-web/sail';
import type { TokenListContainer as SPLTokenListContainer } from '@solana/spl-token-registry';
import { TokenListProvider as SPLTokenListProvider } from '@solana/spl-token-registry';

import { BlockchainProvider } from 'app/contexts/blockchain';
import { TokenListProvider } from 'app/contexts/swap';
import { ToastManager } from 'components/common/ToastManager';
import { Providers as SwapProviders } from 'components/pages/swap/Providers';
import { LockAndMintProvider } from 'utils/providers/LockAndMintProvider';

const onConnect = (wallet: ConnectedWallet) => {
  const walletPublicKey = wallet.publicKey.toBase58();
  const keyToDisplay =
    walletPublicKey.length > 20
      ? `${walletPublicKey.substring(0, 7)}.....${walletPublicKey.substring(
          walletPublicKey.length - 7,
          walletPublicKey.length,
        )}`
      : walletPublicKey;

  ToastManager.info('Wallet update', 'Connected to wallet ' + keyToDisplay);
};

const onDisconnect = () => {
  ToastManager.info('Wallet disconnected');
};

const CoreProviders: FC = ({ children }) => {
  return (
    <SeedProvider>
      <SolanaProvider
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        networkConfigs={NETWORK_CONFIGS}
      >
        <SailProvider>
          <TokenAccountsProvider>
            <RatesProvider>
              <NameServiceProvider>{children}</NameServiceProvider>
            </RatesProvider>
          </TokenAccountsProvider>
        </SailProvider>
      </SolanaProvider>
    </SeedProvider>
  );
};

export const Providers: FC = ({ children }) => {
  const [tokenList, setTokenList] = useState<SPLTokenListContainer | null>(null);

  useEffect(() => {
    void new SPLTokenListProvider().resolve().then(setTokenList);
  }, [setTokenList]);

  if (!tokenList) {
    return null;
  }

  return (
    <CoreProviders>
      <TokenListProvider initialState={{ tokenList }}>
        <BlockchainProvider>
          <LockAndMintProvider>
            <SwapProviders>{children}</SwapProviders>
          </LockAndMintProvider>
        </BlockchainProvider>
      </TokenListProvider>
    </CoreProviders>
  );
};
