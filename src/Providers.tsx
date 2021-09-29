import React, { FC, useEffect, useState } from 'react';

import {
  TokenListContainer as SPLTokenListContainer,
  TokenListProvider as SPLTokenListProvider,
} from '@solana/spl-token-registry';

import { TokenListProvider } from 'app/contexts/swap';
import { LockAndMintProvider } from 'utils/providers/LockAndMintProvider';
import { SolanaContextProvider } from 'utils/providers/SolnaProvider';

export const Providers: FC = ({ children }) => {
  const [tokenList, setTokenList] = useState<SPLTokenListContainer | null>(null);

  useEffect(() => {
    void new SPLTokenListProvider().resolve().then(setTokenList);
  }, [setTokenList]);

  if (!tokenList) {
    return null;
  }

  return (
    <TokenListProvider initialState={{ tokenList }}>
      <SolanaContextProvider>
        <LockAndMintProvider>{children}</LockAndMintProvider>
      </SolanaContextProvider>
    </TokenListProvider>
  );
};
