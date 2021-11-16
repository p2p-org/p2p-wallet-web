import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import type { SolanaProvider as RenSolanaProvider } from '@renproject/chains-solana';
import type { Transaction } from '@solana/web3.js';
import { createContainer } from 'unstated-next';

import { getConnection } from 'api/connection';
import { getWallet } from 'api/wallet';

export type SetSlot = (slot: number) => void;

export interface UseSolana extends RenSolanaProvider {
  slot: number;
  setSlot: SetSlot;
}

const useSolanaInternal = (): UseSolana => {
  const network = useSelector((state) => state.wallet.network);
  const publicKey = useSelector((state) => state.wallet.publicKey);
  const [slot, setSlot] = useState<number>(0);

  const connection = getConnection(network);

  const wallet = useMemo(() => {
    if (!publicKey) {
      return null;
    }

    return {
      publicKey: getWallet().pubkey,
      signTransaction: (tx: Transaction) => getWallet().sign(tx),
      signAllTransactions: (txs: Transaction[]) => getWallet().signAllTransactions(txs),
    };
  }, [publicKey]);

  return {
    connection,
    wallet,
    slot,
    setSlot,
  };
};

export const { Provider: SolanaProvider, useContainer: useSolana } =
  createContainer(useSolanaInternal);
