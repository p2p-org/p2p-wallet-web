import React, { FC, useEffect, useState } from 'react';

import { TokenListContextProvider } from '@project-serum/swap-ui';
import { TokenListContainer, TokenListProvider } from '@solana/spl-token-registry';

export const Providers: FC = ({ children }) => {
  const [tokenList, setTokenList] = useState<TokenListContainer | null>(null);

  useEffect(() => {
    void new TokenListProvider().resolve().then(setTokenList);
  }, [setTokenList]);

  if (!tokenList) {
    return null;
  }

  return <TokenListContextProvider tokenList={tokenList}>{children}</TokenListContextProvider>;
};
