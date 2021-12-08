import { useCallback, useContext } from 'react';

import { DEFAULT_SEED_AND_MNEMONIC } from '../constants';
import { GetSeedAndMnemonicContext, SetSeedAndMnemonicContext } from '../provider';

export const useLockedState = () => {
  const ctxSet = useContext(SetSeedAndMnemonicContext);
  const ctxGet = useContext(GetSeedAndMnemonicContext);

  if (ctxSet === null || ctxGet === null) {
    throw new Error('Context not available');
  }

  const { setUnencryptedSeedAndMnemonic } = ctxSet;

  const setDefaultSeedAndMnemonic = useCallback(() => {
    setUnencryptedSeedAndMnemonic(DEFAULT_SEED_AND_MNEMONIC);
  }, [setUnencryptedSeedAndMnemonic]);

  return [!!ctxGet.unencryptedSeedAndMnemonic.seed, setDefaultSeedAndMnemonic];
};
