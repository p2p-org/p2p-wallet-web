import { useContext } from 'react';

import { SetSeedAndMnemonicContext } from '../provider';

export const useUnlockSeedAndMnemonic = () => {
  const ctx = useContext(SetSeedAndMnemonicContext);

  if (ctx === null) {
    throw new Error('Context not available');
  }

  return ctx.unlockSeedAndMnemonic;
};
