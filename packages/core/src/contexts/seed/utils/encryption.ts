import bs58 from 'bs58';
import { pbkdf2 } from 'crypto';
import nacl from 'tweetnacl';

import type { Encrypt, SeedAndMnemonic } from '../types';

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

export const decryptSeedAndMnemonic = async (
  password: string,
  encryptedText: string,
): Promise<SeedAndMnemonic> => {
  const encrypted: Encrypt = JSON.parse(encryptedText);
  const decrypted = await decryptEncryptedTextAsync(encrypted, password);

  return JSON.parse(Buffer.from(decrypted).toString());
};

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
