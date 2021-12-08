import { useCallback } from 'react';

import { StorageKeys } from '../../../../internal/constants/storageKeys';
import { useStorage } from '../../../../internal/hooks/useStorage';
import type { SeedAndMnemonic } from '../types';
import { generateEncryptedTextAsync } from '../utils/encryption';
import { setUnencryptedSeedAndMnemonic } from '../utils/unencryptedSeedAndMnemonic';

export const useEncryptedSeedAndMnemonic = (): [
  string,
  boolean,
  (nextSeedAndMnemonic: SeedAndMnemonic, password: string, isSaveUnencrypted: boolean) => void,
] => {
  const [encryptedSeedAndMnemonic, isLoading, _setEncryptedSeedAndMnemonic] = useStorage(
    StorageKeys.EncryptedSeedAndMnemonic,
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

  return [encryptedSeedAndMnemonic, isLoading, setEncryptedSeedAndMnemonic];
};
