import React, { createContext, FC, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { SolanaProvider } from '@renproject/chains-solana';
import { Transaction } from '@solana/web3.js';

import { getConnection } from 'api/connection';
import { getWallet } from 'api/wallet';

const SolanaContext = createContext<null | SolanaProvider>(null);

export const SolanaContextProvider: FC = ({ children }) => {
  const publicKey = useSelector((state) => state.wallet.publicKey);

  const provider = useMemo(() => {
    if (!publicKey) {
      return null;
    }

    return {
      connection: getConnection(),
      wallet: {
        publicKey: getWallet().pubkey,
        signTransaction: (tx: Transaction) => getWallet().sign(tx),
      },
    };
  }, [publicKey]);

  const content = useMemo(() => children, [children]);

  return <SolanaContext.Provider value={provider}>{content}</SolanaContext.Provider>;
};

export const useSolanaProvider = (): SolanaProvider => {
  const ctx = useContext(SolanaContext);
  if (ctx === null) {
    throw new Error('Context not available');
  }
  return ctx;
};
