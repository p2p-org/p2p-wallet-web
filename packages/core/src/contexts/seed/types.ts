export type SeedAndMnemonic = {
  seed: string;
  mnemonic: string;
};

export type Encrypt = {
  encrypted: string;
  nonce: string;
  kdf: string;
  salt: string;
  iterations: number;
  digest: string;
};
