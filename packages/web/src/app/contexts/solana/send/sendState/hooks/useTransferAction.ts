import { useCallback } from 'react';

import { useSolana, useWallet } from '@p2p-wallet-web/core';
import { useSail } from '@p2p-wallet-web/sail';
import type { TokenAmount } from '@saberhq/token-utils';
import type { PublicKey } from '@solana/web3.js';

import { useSettings } from 'app/contexts';

import { transfer } from './transfer';

export type TransferParameters = {
  source: PublicKey;
  destination: PublicKey;
  amount: TokenAmount;
};

export const useTransferAction = () => {
  const {
    settings: { useFreeTransactions },
  } = useSettings();
  const { providerMut } = useSolana();
  const { publicKey } = useWallet();
  const { handleTX } = useSail();

  return useCallback(
    (params: TransferParameters) => async (): Promise<string> => {
      if (!providerMut) {
        throw new Error('Provider not ready');
      }

      // let resultSignature: string;
      // if (useFreeTransactions) {
      //   // const FeeRelayerAPI = FeeRelayerAPIFactory(walletState.network);
      //   // resultSignature = await FeeRelayerAPI.transfer(parameters, tokenAccount);
      // } else {
      const tx = await transfer(providerMut, params, publicKey);
      const result = await handleTX(tx, `Transfer ${params.amount.formatUnits()}`);
      if (!result.success || !result.pending) {
        throw new Error('Error transfer');
      }

      return result.pending.signature;
      // }
    },
    [handleTX, providerMut, publicKey],
  );
};
