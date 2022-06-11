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
  ModalsProvider,
  NameServiceProvider,
  RatesProvider,
  SettingsProvider,
} from 'app/contexts';
import { ToastManager } from 'components/common/ToastManager';
import { Providers as SwapProviders } from 'components/pages/swap/Providers';
import * as SolanaSDK from 'new/app/sdk/SolanaSDK';
import { DI_KEYS } from 'new/core/Constants';
import DependencyContext, { DependencyService } from 'new/services/injection/DependencyContext';
import { LockAndMintProvider } from 'utils/providers/LockAndMintProvider';

const PUBLIC_KEY_LENGTH_FOR_TRIMMING = 20;

const solanaNetwork =
  process.env.REACT_APP_SOLANA_NETWORK ?? SolanaSDK.APIEndpoint.defaultEndpoints[2]!.network;
const solanaRpcHost =
  process.env.REACT_APP_SOLANA_RPC_HOST ?? SolanaSDK.APIEndpoint.defaultEndpoints[2]!.address;

console.log('~~~ Index Props: ', solanaNetwork, solanaRpcHost);
DependencyService.registerValue(DI_KEYS.SOLANA_NETWORK, solanaNetwork);
DependencyService.registerValue(DI_KEYS.SOLANA_RPC_HOST, solanaRpcHost);

const onConnect = (wallet: ConnectedWallet) => {
  const walletPublicKey = wallet.publicKey.toBase58();
  const keyToDisplay =
    walletPublicKey.length > PUBLIC_KEY_LENGTH_FOR_TRIMMING
      ? // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        `${walletPublicKey.substring(0, 7)}.....${walletPublicKey.substring(
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
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
                    <SwapProviders>
                      <ModalsProvider>
                        <DependencyContext.Provider value={DependencyService.container()}>
                          {children}
                        </DependencyContext.Provider>
                      </ModalsProvider>
                    </SwapProviders>
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
