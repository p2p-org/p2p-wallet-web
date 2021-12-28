import { useCallback } from 'react';

import { useSolana, useTokenAccountsContext, useWallet } from '@p2p-wallet-web/core';
import type { HandleTXResponse } from '@p2p-wallet-web/sail';
import { useSail } from '@p2p-wallet-web/sail';
import type { PublicKey } from '@solana/web3.js';

import { closeAccount } from 'app/instructions';

export type CloseTokenParams = {
  publicKey: PublicKey;
};

export const useCloseTokenAccount = () => {
  const { providerMut } = useSolana();
  const { publicKey } = useWallet();
  const { handleTX } = useSail();
  const { updateUserTokenAccountKeys } = useTokenAccountsContext();

  return useCallback(
    async (params: CloseTokenParams): Promise<HandleTXResponse> => {
      if (!providerMut) {
        throw new Error('Provider not ready');
      }

      const tx = closeAccount(providerMut, params.publicKey, publicKey);
      const result = await handleTX(tx, `Close token account ${params.publicKey.toBase58()}`);
      if (result.success) {
        // TODO: as i checked, you need to reinvestigate better way to update tokens after close
        // because now it shows after this update
        updateUserTokenAccountKeys();
      }

      return result;
    },
    [handleTX, providerMut, publicKey],
  );
};
