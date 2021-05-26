export type DataType = {
  type?: 'login' | 'signup';
  mnemonic: string;
  seed: string;
  derivationPath: string;
  password: string;
};
