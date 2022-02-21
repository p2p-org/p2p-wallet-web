import { useCallback } from 'react';

import { useSolana, useWallet } from '@p2p-wallet-web/core';
import { useSail } from '@p2p-wallet-web/sail';

import { useFeeCompensation, useFeeRelayer, useSettings } from 'app/contexts';
import type { RelayTransferParams } from 'app/contexts/api/feeRelayer/types';
import { transfer } from 'app/instructions';

export const useTransferAction = () => {
  const {
    settings: { useFreeTransactions },
  } = useSettings();
  const { providerMut } = useSolana();
  const { publicKey } = useWallet();
  const { handleTX } = useSail();
  const { transfer: relayTransfer, relayTopUpWithSwap } = useFeeRelayer();
  const { feeToken, feeAmountInToken, compensationSwapData, compensationState } =
    useFeeCompensation();

  return useCallback(
    (params: RelayTransferParams) => async (): Promise<string> => {
      if (!providerMut || !publicKey) {
        throw new Error('Provider not ready');
      }

      if (useFreeTransactions && compensationState.sendMethod === 'feeRelayer') {
        if (compensationState.needTopUp && feeToken) {
          await relayTopUpWithSwap({
            feeAmount: compensationState.topUpCompensationFee,
            feeToken,
            feeAmountInToken,
            needCreateRelayAccount: compensationState.needCreateRelayAccount,
            topUpParams: compensationSwapData,
          });
        }
        const signature = await relayTransfer(params, {
          feeAmount: compensationState?.nextTransactionFee,
          feeToken,
        });
        return signature as string;
      } else {
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
      }
    },
    [
      compensationState,
      compensationSwapData,
      feeAmountInToken,
      feeToken,
      handleTX,
      providerMut,
      publicKey,
      relayTopUpWithSwap,
      relayTransfer,
      useFreeTransactions,
    ],
  );
};
