import { useContext } from 'react';

import { GetSeedAndMnemonicContext, SetSeedAndMnemonicContext } from '../provider';

export const useSeedAndMnemonic = () => {
  const ctxSet = useContext(SetSeedAndMnemonicContext);
  const ctxGet = useContext(GetSeedAndMnemonicContext);

  if (ctxSet === null || ctxGet === null) {
    throw new Error('Context not available');
  }

  return {
    ...ctxSet,
    ...ctxGet,
  };
};
