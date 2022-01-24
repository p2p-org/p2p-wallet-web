import { useCallback } from 'react';

import { useFeeRelayer } from 'app/contexts';
import type { RelayTransferParams } from 'app/contexts/api/feeRelayer/types';
// import { useSolana, useWallet } from '@p2p-wallet-web/core';
// import { useSail } from '@p2p-wallet-web/sail';

// import { useSettings } from 'app/contexts';
// import type { TransferParameters } from 'app/instructions';
// import { transfer } from 'app/instructions';

export const useTransferAction = () => {
  // const {
  //   settings: { useFreeTransactions },
  // } = useSettings();
  // const { providerMut } = useSolana();
  // const { publicKey } = useWallet();
  // const { handleTX } = useSail();
  const { transfer, relayTopUpWithSwap } = useFeeRelayer();

  return useCallback(
    (params: RelayTransferParams) => async (): Promise<string> => {
      // if (!providerMut) {
      //   throw new Error('Provider not ready');
      // }

      // let resultSignature: string;
      // if (useFreeTransactions) {
      //   // const FeeRelayerAPI = FeeRelayerAPIFactory(walletState.network);
      //   // resultSignature = await FeeRelayerAPI.transfer(parameters, tokenAccount);
      // } else {
      // const tx = await transfer(providerMut, params, publicKey);
      // const result = await handleTX(tx, `Transfer ${params.amount.formatUnits()}`);
      // if (!result.success || !result.pending) {
      //   throw new Error('Error transfer');
      // }

      // return result.pending.signature;
      // }
      if (params.compensation) {
        await relayTopUpWithSwap(params.compensation);
      }

      const signature = await transfer(params);
      return signature as string;
    },
    [relayTopUpWithSwap, transfer /*, handleTX, providerMut, publicKey */],
  );
};
