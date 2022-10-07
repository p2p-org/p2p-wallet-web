import * as bip39 from 'bip39';
import bs58 from 'bs58';
import { pbkdf2 } from 'crypto';
import nacl from 'tweetnacl';

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

// @TODO where is this logic coming from?
export const generateEncryptedTextAsync = async (plaintext: string, password: string) => {
  const salt = nacl.randomBytes(16);
  const kdf = 'pbkdf2';
  const iterations = 100000;
  const digest = 'sha256';

  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const key = await deriveEncryptionKey(password, salt, iterations, digest);
  const encrypted = nacl.secretbox(Buffer.from(plaintext), nonce, key);

  return {
    encrypted: bs58.encode(encrypted),
    nonce: bs58.encode(nonce),
    kdf,
    salt: bs58.encode(salt),
    iterations,
    digest,
  };
};

export const setStorageValue = <T>(key: string, data: T, { msTTL }: { msTTL?: number } = {}) => {
  const expiringData = createExpiringValue(data, msTTL);
  return localStorage.setItem(key, JSON.stringify(expiringData));
};
