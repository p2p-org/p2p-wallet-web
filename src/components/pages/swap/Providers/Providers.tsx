import React, { FC, useEffect, useMemo, useState } from 'react';

import { Provider, Wallet } from '@project-serum/anchor';
import { Swap as SwapClient } from '@project-serum/swap';
import { TokenListContainer, TokenListProvider } from '@solana/spl-token-registry';
import { ConfirmOptions } from '@solana/web3.js';

import { getConnection } from 'api/connection';
import { getWallet } from 'api/wallet';
import { DexProvider, SwapProvider, TokenProvider } from 'app/contexts/swap';

export const Providers: FC = ({ children }) => {
  const [tokenList, setTokenList] = useState<TokenListContainer | null>(null);
  const wallet = getWallet();

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
    <TokenProvider initialState={{ provider }}>
      <DexProvider initialState={{ swapClient }}>
        <SwapProvider>{children}</SwapProvider>
      </DexProvider>
    </TokenProvider>
  );
};
