import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_SEED_AND_MNEMONIC } from '../constants';
import type { SeedAndMnemonic } from '../types';
import {
  getUnencryptedSeedAndMnemonic,
  setUnencryptedSeedAndMnemonic,
} from '../utils/unencryptedSeedAndMnemonic';

export const useUnencryptedSeedAndMnemonic = (): [
  SeedAndMnemonic,
  (nextSeedAndMnemonic: SeedAndMnemonic) => void,
] => {
  const [seedAndMnemonic, _setSeedAndMnemonic] =
    useState<SeedAndMnemonic>(DEFAULT_SEED_AND_MNEMONIC);

  useEffect(() => {
    try {
      const unencryptedSeedAndMnemonic = getUnencryptedSeedAndMnemonic();
      _setSeedAndMnemonic(unencryptedSeedAndMnemonic || DEFAULT_SEED_AND_MNEMONIC);
    } catch (r) {
      console.error(r);
    }
  }, []);

  const _setUnencryptedSeedAndMnemonic = useCallback(
    (nextSeedAndMnemonic: SeedAndMnemonic) => {
      _setSeedAndMnemonic(nextSeedAndMnemonic);
      setUnencryptedSeedAndMnemonic(nextSeedAndMnemonic);
    },
    [_setSeedAndMnemonic],
  );

  return [seedAndMnemonic, _setUnencryptedSeedAndMnemonic];
};
