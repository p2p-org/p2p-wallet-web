import type { ValueOf } from '@p2p-wallet-web/core/dist/esm';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import bs58 from 'bs58';
import { pbkdf2 } from 'crypto';
import * as ed25519 from 'ed25519-hd-key';
import nacl from 'tweetnacl';

export const DERIVATION_PATH = {
  Deprecated: 'deprecated',
  Bip44: 'bip44',
  Bip44Change: 'bip44Change',
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

function getKeyPairFromSeed(
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

/* eslint-disable */
export function loggable() {
  return function (_: any, propertyKey: string, __: PropertyDescriptor) {
    console.log('**************************');
    console.log(_.metadata);
    console.log(propertyKey);
  };
}
/* eslint-enable */
