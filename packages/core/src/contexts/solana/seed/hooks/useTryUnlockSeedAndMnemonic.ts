import { useCallback, useContext } from 'react';

import { GetSeedAndMnemonicContext } from '../provider';
import { decryptSeedAndMnemonic } from '../utils/encryption';

export const useTryUnlockSeedAndMnemonic = () => {
  const ctx = useContext(GetSeedAndMnemonicContext);

  if (ctx === null) {
    throw new Error('Context not available');
  }

  const { encryptedSeedAndMnemonic } = ctx;

  return useCallback(
    async (password: string) => {
      await decryptSeedAndMnemonic(password, encryptedSeedAndMnemonic);
    },
    [encryptedSeedAndMnemonic],
  );
};
