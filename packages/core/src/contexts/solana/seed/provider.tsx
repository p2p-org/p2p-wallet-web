import type { FC } from 'react';
import React, { createContext, useCallback, useEffect } from 'react';

import { NOOP, NOOP_ASYNC } from '../../../internal/utils/noop';
import { DEFAULT_SEED_AND_MNEMONIC } from './constants';
import { useUnencryptedSeedAndMnemonic } from './hooks';
import { useEncryptedSeedAndMnemonic } from './hooks/useEncryptedSeedAndMnemonic';
import type { SeedAndMnemonic } from './types';
import { decryptSeedAndMnemonic } from './utils/encryption';

type SetSeedAndMnemonicContext = {
  setUnencryptedSeedAndMnemonic: (nextSeedAndMnemonic: SeedAndMnemonic) => void;
  setEncryptedSeedAndMnemonic: (
    nextSeedAndMnemonic: SeedAndMnemonic,
    password: string,
    isSaveUnencrypted: boolean,
  ) => void;
  unlockSeedAndMnemonic: (password: string) => Promise<void>;
};

type GetSeedAndMnemonicContext = {
  unencryptedSeedAndMnemonic: SeedAndMnemonic;
  encryptedSeedAndMnemonic: string;
};

export const SetSeedAndMnemonicContext = createContext<SetSeedAndMnemonicContext>({
  setUnencryptedSeedAndMnemonic: NOOP,
  setEncryptedSeedAndMnemonic: NOOP_ASYNC,
  unlockSeedAndMnemonic: NOOP_ASYNC,
});

export const GetSeedAndMnemonicContext = createContext<GetSeedAndMnemonicContext>({
  unencryptedSeedAndMnemonic: DEFAULT_SEED_AND_MNEMONIC,
  encryptedSeedAndMnemonic: '',
});

type Props = {
  children: React.ReactNode;
};

export const SeedProvider: FC<Props> = ({ children }) => {
  const [encryptedSeedAndMnemonic, isLoadingEncryptedSeedAndMnemonic, setEncryptedSeedAndMnemonic] =
    useEncryptedSeedAndMnemonic();
  const [
    unencryptedSeedAndMnemonic,
    isLoadingUnencryptedSeedAndMnemonic,
    setUnencryptedSeedAndMnemonic,
  ] = useUnencryptedSeedAndMnemonic();

  useEffect(() => {
    if (unencryptedSeedAndMnemonic.mnemonic && unencryptedSeedAndMnemonic.seed) {
      setUnencryptedSeedAndMnemonic(unencryptedSeedAndMnemonic);
    }
  }, [unencryptedSeedAndMnemonic]);

  const unlockSeedAndMnemonic = useCallback(
    async (password: string) => {
      setUnencryptedSeedAndMnemonic(
        await decryptSeedAndMnemonic(password, encryptedSeedAndMnemonic),
      );
    },
    [encryptedSeedAndMnemonic, setUnencryptedSeedAndMnemonic],
  );

  if (isLoadingEncryptedSeedAndMnemonic || isLoadingUnencryptedSeedAndMnemonic) {
    return null;
  }

  return (
    <SetSeedAndMnemonicContext.Provider
      value={{
        setUnencryptedSeedAndMnemonic,
        setEncryptedSeedAndMnemonic,
        unlockSeedAndMnemonic,
      }}
    >
      <GetSeedAndMnemonicContext.Provider
        value={{
          unencryptedSeedAndMnemonic,
          encryptedSeedAndMnemonic,
        }}
      >
        {children}
      </GetSeedAndMnemonicContext.Provider>
    </SetSeedAndMnemonicContext.Provider>
  );
};
