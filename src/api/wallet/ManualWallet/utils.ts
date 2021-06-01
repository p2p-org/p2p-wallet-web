// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-case-declarations */
import { Account } from '@solana/web3.js';
import * as bip32 from 'bip32';
import bs58 from 'bs58';
import { pbkdf2 } from 'crypto';
import * as ed25519 from 'ed25519-hd-key';
import nacl from 'tweetnacl';

import { ERROR_WRONG_PASSWORD } from 'api/wallet/ManualWallet/errors';

export type LockedType = {
  account: string;
  encrypted: string;
  nonce: string;
  kdf: string;
  salt: string;
  iterations: number;
  digest: string;
};

type UnlockedType = {
  mnemonic: string | null;
  seed: string | null;
  derivationPath: string | null;
};

export const DERIVATION_PATH = {
  deprecated: 'deprecated',
  bip44: 'bip44',
  bip44Change: 'bip44Change',
};

const STORAGE_KEY_UNLOCKED = 'unlocked';
export const STORAGE_KEY_LOCKED = 'locked';

const EMPTY_UNLOCKED: UnlockedType = {
  mnemonic: null,
  seed: null,
  derivationPath: null,
};

let unlockedMnemonicAndSeed: UnlockedType = EMPTY_UNLOCKED;

export async function mnemonicToSeed(mnemonic: string) {
  const bip39 = await import('bip39');
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid seed words');
  }
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return Buffer.from(seed).toString('hex');
}

function deriveSeed(
  seed: Buffer,
  walletIndex: number,
  derivationPath: string,
  accountIndex: number,
): Buffer | undefined {
  switch (derivationPath) {
    case DERIVATION_PATH.deprecated:
      const path = `m/501'/${walletIndex}'/0/${accountIndex}`;
      return bip32.fromSeed(seed).derivePath(path).privateKey;
    case DERIVATION_PATH.bip44:
      const path44 = `m/44'/501'/${walletIndex}'`;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return ed25519.derivePath(path44, seed).key;
    case DERIVATION_PATH.bip44Change:
      const path44Change = `m/44'/501'/${walletIndex}'/0'`;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return ed25519.derivePath(path44Change, seed).key;
    default:
      throw new Error(`invalid derivation path: ${derivationPath}`);
  }
}

export function getAccountFromSeed(
  seed: Buffer,
  walletIndex: number,
  derivationPath: string,
  accountIndex = 0,
) {
  const derivedSeed = deriveSeed(seed, walletIndex, derivationPath, accountIndex) as Uint8Array;
  return new Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
}

export function getDerivableAccounts(seed: string, derivationPath: string) {
  return new Array(5)
    .fill(null)
    .map((_, idx) => getAccountFromSeed(Buffer.from(seed, 'hex'), idx, derivationPath));
}

async function deriveEncryptionKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
  digest: string,
) {
  return new Promise((resolve, reject) =>
    pbkdf2(password, salt, iterations, nacl.secretbox.keyLength, digest, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

export async function storeMnemonicAndSeed(
  mnemonic: string,
  seed: string,
  derivationPath: string,
  password?: string,
  isSave?: boolean,
) {
  const plaintext = JSON.stringify({ mnemonic, seed, derivationPath });

  if (password) {
    const salt = nacl.randomBytes(16);
    const kdf = 'pbkdf2';
    const iterations = 100000;
    const digest = 'sha256';
    const key = (await deriveEncryptionKey(password, salt, iterations, digest)) as Buffer;
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const encrypted = nacl.secretbox(Buffer.from(plaintext), nonce, key);

    const account = getAccountFromSeed(Buffer.from(seed, 'hex'), 0, derivationPath);
    const locked = JSON.stringify({
      account: account.publicKey.toBase58(),
      encrypted: bs58.encode(encrypted),
      nonce: bs58.encode(nonce),
      kdf,
      salt: bs58.encode(salt),
      iterations,
      digest,
    });

    if (isSave) {
      localStorage.setItem(STORAGE_KEY_LOCKED, locked);
    }
  }

  unlockedMnemonicAndSeed = { mnemonic, seed, derivationPath };
}

export async function loadMnemonicAndSeed(password?: string): Promise<UnlockedType> {
  if (!password) {
    return new Promise((resolve) => {
      return resolve(unlockedMnemonicAndSeed);
    });
  }

  const {
    encrypted: encodedEncrypted,
    nonce: encodedNonce,
    salt: encodedSalt,
    iterations,
    digest,
  } = JSON.parse(localStorage.getItem(STORAGE_KEY_LOCKED) || '') as LockedType;

  const encrypted = bs58.decode(encodedEncrypted);
  const nonce = bs58.decode(encodedNonce);
  const salt = bs58.decode(encodedSalt);
  const key = (await deriveEncryptionKey(password, salt, iterations, digest)) as Buffer;

  const plaintext = nacl.secretbox.open(encrypted, nonce, key);
  if (!plaintext) {
    throw new Error(ERROR_WRONG_PASSWORD);
  }

  const decodedPlaintext = Buffer.from(plaintext).toString();
  const decoded = JSON.parse(decodedPlaintext) as UnlockedType;

  unlockedMnemonicAndSeed = decoded;

  return decoded;
}

export function forgetWallet() {
  sessionStorage.removeItem(STORAGE_KEY_UNLOCKED);
}
