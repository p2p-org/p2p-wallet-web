import { useCallback } from 'react';

import { useStorage } from '../../../hooks';
import { STORAGE_KEYS } from '../../../internal/constants/storageKeys';
import type { SeedAndMnemonic } from '../types';
import { generateEncryptedTextAsync } from '../utils/encryption';
import { setUnencryptedSeedAndMnemonic } from '../utils/unencryptedSeedAndMnemonic';

export const useEncryptedSeedAndMnemonic = (): [
  string,
  (nextSeedAndMnemonic: SeedAndMnemonic, password: string, isSaveUnencrypted: boolean) => void,
] => {
  const [encryptedSeedAndMnemonic, _setEncryptedSeedAndMnemonic] = useStorage(
    STORAGE_KEYS.EncryptedSeedAndMnemonic,
    '',
  );

  const setEncryptedSeedAndMnemonic = useCallback(
    async (nextSeedAndMnemonic: SeedAndMnemonic, password: string, isSaveUnencrypted: boolean) => {
      const plaintext = JSON.stringify(nextSeedAndMnemonic);
      const locked = await generateEncryptedTextAsync(plaintext, password);
      _setEncryptedSeedAndMnemonic(JSON.stringify(locked));

      if (isSaveUnencrypted) {
        setUnencryptedSeedAndMnemonic(nextSeedAndMnemonic);
      }
    },
    [],
  );

  return [encryptedSeedAndMnemonic, setEncryptedSeedAndMnemonic];
};
