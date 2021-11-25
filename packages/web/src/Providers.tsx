import type { FC } from 'react';
import React, { useEffect, useState } from 'react';

import type { TokenListContainer as SPLTokenListContainer } from '@solana/spl-token-registry';
import { TokenListProvider as SPLTokenListProvider } from '@solana/spl-token-registry';

import { SolanaProvider } from 'app/contexts/solana';
import { TokenListProvider } from 'app/contexts/swap';
import { Providers as SwapProviders } from 'components/pages/swap/Providers';
import { LockAndMintProvider } from 'utils/providers/LockAndMintProvider';

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
      <SolanaProvider>
        <LockAndMintProvider>
          <SwapProviders>{children}</SwapProviders>
        </LockAndMintProvider>
      </SolanaProvider>
    </TokenListProvider>
  );
};
