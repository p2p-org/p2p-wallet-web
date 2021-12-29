import type { FC } from 'react';
import { createContext, useCallback, useEffect } from 'react';
import * as React from 'react';

import { NOOP, NOOP_ASYNC } from '../../internal/utils/noop';
import { DEFAULT_SEED_AND_MNEMONIC } from './constants';
import { useEncryptedSeedAndMnemonic, useUnencryptedSeedAndMnemonic } from './hooks';
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
  const [encryptedSeedAndMnemonic, setEncryptedSeedAndMnemonic] = useEncryptedSeedAndMnemonic();
  const [unencryptedSeedAndMnemonic, setUnencryptedSeedAndMnemonic] =
    useUnencryptedSeedAndMnemonic();

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
