import type { FC } from 'react';
import React, { useCallback, useMemo } from 'react';

import type { WalletError } from '@solana/wallet-adapter-base';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import {
  getLedgerWallet,
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletExtensionWallet,
  getSolletWallet,
  getTorusWallet,
} from '@solana/wallet-adapter-wallets';

type Props = {
  children: React.ReactNode;
};

export const WalletProvider: FC<Props> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSlopeWallet(),
      getSolflareWallet(),
      getTorusWallet({
        options: { clientId: 'Get a client ID @ https://developer.tor.us' },
      }),
      getLedgerWallet(),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
    ],
    [network],
  );

  const onError = useCallback(
    (error: WalletError) =>
      console.error(
        'Wallet error: ',
        error.message ? `${error.name}: ${error.message}` : error.name,
      ),
    [],
  );

  return (
    <SolanaWalletProvider wallets={wallets} onError={onError} autoConnect>
      {children}
    </SolanaWalletProvider>
  );
};

export { useWallet } from '@solana/wallet-adapter-react';
