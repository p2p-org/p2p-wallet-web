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

  const provider = useMemo(() => {
    try {
      const wallet = Object.assign(
        Object.create(Object.getPrototypeOf(getWallet())),
        getWallet(),
      ) as Wallet;
      const connection = getConnection();
      const opts: ConfirmOptions = {
        preflightCommitment: 'recent',
        commitment: 'recent',
      };

      return new Provider(connection, wallet, opts);
    } catch {
      return null;
    }
  }, []);

  const swapClient = useMemo(() => {
    if (!tokenList || !provider) {
      return null;
    }

    return new SwapClient(provider, tokenList);
  }, [provider, tokenList]);

  useEffect(() => {
    void new TokenListProvider().resolve().then(setTokenList);
  }, [setTokenList]);

  if (!tokenList || !provider) {
    return null;
  }

  return (
    <TokenContextProvider provider={provider}>
      <DexContextProvider swapClient={swapClient}>
        <SwapContextProvider>{children}</SwapContextProvider>
      </DexContextProvider>
    </TokenContextProvider>
  );
};
