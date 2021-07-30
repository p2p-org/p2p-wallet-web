import React, { FC, useEffect, useMemo, useState } from 'react';

import { Provider, Wallet } from '@project-serum/anchor';
import { Swap as SwapClient } from '@project-serum/swap';
import {
  DexContextProvider,
  SwapContextProvider,
  TokenContextProvider,
} from '@project-serum/swap-ui';
import { TokenListContainer, TokenListProvider } from '@solana/spl-token-registry';
import { ConfirmOptions } from '@solana/web3.js';

import { getConnection } from 'api/connection';
import { getWallet } from 'api/wallet';

export const Providers: FC = ({ children }) => {
  const [tokenList, setTokenList] = useState<TokenListContainer | null>(null);

  useEffect(() => {
    void new TokenListProvider().resolve().then(setTokenList);
  }, [setTokenList]);

  const provider = useMemo(() => {
    const opts: ConfirmOptions = {
      preflightCommitment: 'recent',
      commitment: 'recent',
    };

    try {
      const wallet = getWallet() as Wallet;
      const connection = getConnection();

      return new Provider(connection, wallet, opts);
    } catch {
      return null;
    }
  }, []);

  if (!tokenList || !provider) {
    return null;
  }

  const swapClient = new SwapClient(provider, tokenList);

  return (
    <TokenContextProvider provider={provider}>
      <DexContextProvider swapClient={swapClient}>
        <SwapContextProvider>{children}</SwapContextProvider>
      </DexContextProvider>
    </TokenContextProvider>
  );
};
