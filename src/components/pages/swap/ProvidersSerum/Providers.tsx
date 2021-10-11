import React, { FC, useEffect, useMemo, useState } from 'react';

// import { useParams } from 'react-router-dom';
import { Provider, Wallet } from '@project-serum/anchor';
import { TokenListContainer, TokenListProvider } from '@solana/spl-token-registry';
import { ConfirmOptions } from '@solana/web3.js';

import { getConnection } from 'api/connection';
import { getWallet } from 'api/wallet';
import { DexProvider, SwapProvider, TokenProvider } from 'app/contexts/swapSerum';
import { Swap as SwapClient } from 'app/libs/swap';

export const Providers: FC = ({ children }) => {
  // const { publicKey } = useParams<{ publicKey: string }>();

  const [tokenList, setTokenList] = useState<TokenListContainer | null>(null);
  const wallet = getWallet();

  const fromMint = useMemo(
    () => {
      // TODO: need to load mint by publickey
      return undefined;
    },
    [
      /*publicKey*/
    ],
  );

  const provider = useMemo(() => {
    try {
      const walletNew = Object.assign(
        Object.create(Object.getPrototypeOf(wallet)),
        wallet,
      ) as Wallet;
      const connection = getConnection();
      const opts: ConfirmOptions = {
        preflightCommitment: 'recent',
        commitment: 'recent',
      };

      return new Provider(connection, walletNew, opts);
    } catch {
      return null;
    }
  }, [wallet]);

  useEffect(() => {
    void new TokenListProvider().resolve().then(setTokenList);
  }, [setTokenList]);

  const swapClient = useMemo(() => {
    if (!tokenList || !provider) {
      return null;
    }

    return new SwapClient(provider, tokenList);
  }, [provider, tokenList]);

  if (!swapClient || !tokenList || !provider) {
    return null;
  }

  return (
    <TokenProvider initialState={{ provider }}>
      <DexProvider initialState={{ swapClient }}>
        <SwapProvider initialState={{ fromMint }}>{children}</SwapProvider>
      </DexProvider>
    </TokenProvider>
  );
};
