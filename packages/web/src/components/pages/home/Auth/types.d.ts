import type { DERIVATION_PATH, ValueOf } from '@p2p-wallet-web/core';

export type DataType = {
  type?: 'login' | 'signup';
  mnemonic: string;
  seed: string;
  derivationPath: ValueOf<typeof DERIVATION_PATH>;
  password: string;
};
