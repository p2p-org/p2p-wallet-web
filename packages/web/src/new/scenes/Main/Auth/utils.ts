import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import bs58 from 'bs58';
import { pbkdf2 } from 'crypto';
import * as ed25519 from 'ed25519-hd-key';
import type { DBSchema } from 'idb';
import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb/build/entry';
import nacl from 'tweetnacl';

import type { ExpiryDataType, ValueOf } from './typings';

export const DERIVATION_PATH = {
  Deprecated: 'deprecated',
  Bip44: 'bip44',
  Bip44Change: 'bip44Change',
};

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

export const createExpiringValue = <T>(value: T, ms?: number) => {
  if (ms) {
    return {
      value,
      expiry: Date.now() + ms,
    };
  }

  return {
    value,
    expiry: Number.MAX_SAFE_INTEGER,
  };
};

export const getExpiringValue = <T>(data: ExpiryDataType<T>) => {
  if (!data) {
    return null;
  }

  if (data.expiry < Date.now()) {
    return null;
  }

  return data.value;
};

export function validatePassword(password: string) {
  const isLowerCase = /[a-z]/.test(password);
  const isUpperCase = /[A-Z]/.test(password);
  const isNumber = /\d/.test(password);
  const isMinLength = password.length >= 8;

  return { isLowerCase, isUpperCase, isNumber, isMinLength };
}

export const mnemonicToSeed = async (mnemonic: string) => {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid seed words');
  }
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return Buffer.from(seed).toString('hex');
};

export const setStorageValue = <T>(key: string, data: T, { msTTL }: { msTTL?: number } = {}) => {
  const expiringData = createExpiringValue(data, msTTL);
  return localStorage.setItem(key, JSON.stringify(expiringData));
};

export const getStorageValue = <T>(key: string) => {
  const strData = localStorage.getItem(key);
  if (!strData) {
    return null;
  }

  const value = getExpiringValue(JSON.parse(strData) as ExpiryDataType<T>);

  if (!value) {
    localStorage.removeItem(key);
    return null;
  }

  return value;
};

export const deriveSecretKeyFromSeed = (
  seed: string,
  walletIndex: number,
  derivationPath: ValueOf<typeof DERIVATION_PATH>,
) => {
  return getKeyPairFromSeed(seed, walletIndex, derivationPath).secretKey;
};

const deriveSeed = (
  seed: string,
  walletIndex: number,
  derivationPath: ValueOf<typeof DERIVATION_PATH>,
): Buffer | undefined => {
  switch (derivationPath) {
    case DERIVATION_PATH.Deprecated: {
      const path = `m/501'/${walletIndex}'/0/0`;
      return bip32.fromSeed(Buffer.from(seed, 'hex')).derivePath(path).privateKey;
    }
    case DERIVATION_PATH.Bip44: {
      const path = `m/44'/501'/${walletIndex}'`;
      return ed25519.derivePath(path, seed).key;
    }
    case DERIVATION_PATH.Bip44Change: {
      const path = `m/44'/501'/${walletIndex}'/0'`;
      return ed25519.derivePath(path, seed).key;
    }
  }
};

export function getKeyPairFromSeed(
  seed: string,
  walletIndex: number,
  derivationPath: ValueOf<typeof DERIVATION_PATH>,
) {
  const derivedPrivateKey = deriveSeed(seed, walletIndex, derivationPath);
  if (!derivedPrivateKey) {
    throw new Error('Could not derive secretKey');
  }
  return nacl.sign.keyPair.fromSeed(derivedPrivateKey);
}

export const derivePublicKeyFromSeed = (
  seed: string,
  walletIndex: number,
  derivationPath: ValueOf<typeof DERIVATION_PATH>,
) => {
  return getKeyPairFromSeed(seed, walletIndex, derivationPath).publicKey;
};

interface KeypairDB extends DBSchema {
  cryptoPair: {
    key: string;
    value: CryptoKeyPair;
  };
}

const DB_NAME = 'keys';
export const STORE_NAME = 'cryptoPair';
export const KEYPAIR_KEY = 'keypair';
const INIT_VERSION = 1;

export const getDB = async (): Promise<KeyPairDbInstance> =>
  await openDB<KeypairDB>(DB_NAME, INIT_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });

// @TODO checkout
async function deriveEncryptionKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
  digest: string,
) {
  return new Promise<Buffer>((resolve, reject) =>
    pbkdf2(password, salt, iterations, nacl.secretbox.keyLength, digest, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

export const decryptEncryptedTextAsync = async (t: Encrypt, password: string) => {
  const encrypted = bs58.decode(t.encrypted);
  const nonce = bs58.decode(t.nonce);
  const salt = bs58.decode(t.salt);
  const key = await deriveEncryptionKey(password, salt, t.iterations, t.digest);

  const plaintext = nacl.secretbox.open(encrypted, nonce, key);

  if (!plaintext) {
    throw new Error('Incorrect password');
  }

  return Buffer.from(plaintext).toString();
};

export type KeyPairDbInstance = IDBPDatabase<KeypairDB>;
