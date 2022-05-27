import { useCallback } from 'react';

import type { TokenAccount } from '@p2p-wallet-web/core';
import { useSolana, useWallet } from '@p2p-wallet-web/core';
import { useSail } from '@p2p-wallet-web/sail';
import type { TokenAmount } from '@p2p-wallet-web/token-utils';

import type { DestinationAccount } from 'app/contexts/api/feeRelayer/types';
import { transfer } from 'app/instructions';

type TransferParams = {
  fromTokenAccount: TokenAccount;
  destinationAccount: DestinationAccount;
  amount: TokenAmount;
};

export const useTransferAction = () => {
  const { providerMut } = useSolana();
  const { publicKey } = useWallet();
  const { handleTX } = useSail();

  return useCallback(
    (params: TransferParams) => async (): Promise<string> => {
      if (!providerMut || !publicKey) {
        throw new Error('Provider not ready');
      }

      if (!params.fromTokenAccount.key) {
        throw new Error('fromTokenAccount must be set');
      }

      const tx = await transfer(
        providerMut,
        {
          source: params.fromTokenAccount.key,
          destination: params.destinationAccount.address,
          amount: params.amount,
        },
        publicKey,
      );
      const result = await handleTX(tx, `Transfer ${params.amount.formatUnits()}`);
      if (!result.success || !result.pending) {
        throw new Error('Error transfer');
      }

      return result.pending.signature;
    },
    [handleTX, providerMut, publicKey],
  );
};
