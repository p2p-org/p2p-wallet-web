import type { FC } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { IntercomProvider } from 'react-use-intercom';

import type { ConnectedWallet } from '@p2p-wallet-web/core';
import {
  NETWORK_CONFIGS,
  SeedProvider,
  SolanaProvider,
  TokenAccountsProvider,
  TokensProvider,
} from '@p2p-wallet-web/core';
import { SailProvider } from '@p2p-wallet-web/sail';
import assert from 'ts-invariant';

import {
  BlockchainProvider,
  FeatureFlagsProvider,
  FeeRelayerProvider,
  ModalsProvider,
  NameServiceProvider,
  RatesProvider,
  SettingsProvider,
} from 'app/contexts';
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
        <SailProvider initialState={{ waitForConfirmation: true }}>
          <TokensProvider>
            <TokenAccountsProvider>{children}</TokenAccountsProvider>
          </TokensProvider>
        </SailProvider>
      </SolanaProvider>
    </SeedProvider>
  );
};

const ApiProviders: FC = ({ children }) => {
  return (
    <RatesProvider>
      <NameServiceProvider>{children}</NameServiceProvider>
    </RatesProvider>
  );
};

const queryClient = new QueryClient();

export const Providers: FC = ({ children }) => {
  assert(
    process.env.REACT_APP_INTERCOM_APP_ID,
    "REACT_APP_INTERCOM_APP_ID doesn't set in environment",
  );

  return (
    <IntercomProvider
      appId={process.env.REACT_APP_INTERCOM_APP_ID}
      autoBoot
      autoBootProps={{ hideDefaultLauncher: true }}
    >
      <FeatureFlagsProvider>
        <QueryClientProvider client={queryClient}>
          <CoreProviders>
            <ApiProviders>
              <SettingsProvider>
                <BlockchainProvider>
                  <LockAndMintProvider>
                    <FeeRelayerProvider>
                      <SwapProviders>
                        <ModalsProvider>{children}</ModalsProvider>
                      </SwapProviders>
                    </FeeRelayerProvider>
                  </LockAndMintProvider>
                </BlockchainProvider>
              </SettingsProvider>
            </ApiProviders>
          </CoreProviders>
        </QueryClientProvider>
      </FeatureFlagsProvider>
    </IntercomProvider>
  );
};
