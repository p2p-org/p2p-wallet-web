import { useContext } from 'react';

import { GetSeedAndMnemonicContext } from '../provider';

export const useSeed = () => {
  const ctx = useContext(GetSeedAndMnemonicContext);

  if (ctx === null) {
    throw new Error('Context not available');
  }

  return ctx.unencryptedSeedAndMnemonic.seed;
};
