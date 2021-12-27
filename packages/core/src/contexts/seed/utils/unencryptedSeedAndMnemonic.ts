import type { SeedAndMnemonic } from '../types';

let unencryptedSeedAndMnemonic: SeedAndMnemonic;

export const setUnencryptedSeedAndMnemonic = (_unencryptedSeedAndMnemonic: SeedAndMnemonic) => {
  unencryptedSeedAndMnemonic = _unencryptedSeedAndMnemonic;
};

export const getUnencryptedSeedAndMnemonic = (): SeedAndMnemonic | undefined => {
  return unencryptedSeedAndMnemonic;
};
