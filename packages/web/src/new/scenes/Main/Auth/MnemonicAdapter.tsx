import type { WalletName } from '@solana/wallet-adapter-base';
import { BaseMessageSignerWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import type { Signer, Transaction } from '@solana/web3.js';
import { Keypair as SolanaKeypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { pbkdf2 } from 'crypto';
import nacl from 'tweetnacl';

import type { ConnectConfig, StorageInfo } from 'new/scenes/Main/Auth/typings';
import type { KeyPairDbInstance } from 'new/scenes/Main/Auth/utils';
import {
  getDB,
  getKeyPairFromSeed,
  KEYPAIR_KEY,
  setStorageValue,
  STORE_NAME,
} from 'new/scenes/Main/Auth/utils';
import { notImplemented } from 'new/utils/decorators';

export interface Wallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}

export const MnemonicAdapterName = 'MnemonicAdapter' as WalletName;

export class MnemonicAdapter extends BaseMessageSignerWalletAdapter {
  name = MnemonicAdapterName;
  icon = '';
  url = '';
  private _account: Signer | null = null;
  private _connecting = false;
  private _readyState = WalletReadyState.NotDetected;
  private _keypairDB: KeyPairDbInstance | undefined;
  private _extractableKeys = false;
  private _encryptAlgo = 'RSA-OAEP';

  static walletIndex = 0;
  static mnemonicStrength = 256;

  private static _noKeypairError = 'No keypair to sign transactions';
  private static _mnemonicStorageKey = 'encryptedSeedAndMnemonic';
  private static _privateStorageKey = 'walletPrivateKey';

  constructor() {
    super();
  }

  async getLocalSigner(): Promise<Signer | null> {
    const rsaKeypair = await this._getKeyPair();

    const chipherString = localStorage.getItem(MnemonicAdapter._privateStorageKey);

    if (!chipherString) {
      return null;
    }

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: this._encryptAlgo,
      },
      rsaKeypair.privateKey as CryptoKey,
      Buffer.from(chipherString, 'hex'),
    );

    if (!decrypted) {
      return null;
    }

    const keyPair = SolanaKeypair.fromSecretKey(new Uint8Array(decrypted));

    return {
      publicKey: new PublicKey(keyPair.publicKey),
      secretKey: keyPair.secretKey,
    };
  }

  signTransaction(transaction: Transaction): Promise<Transaction> {
    if (this._account) {
      transaction.partialSign(this._account);

      return Promise.resolve(transaction);
    }

    return Promise.reject(MnemonicAdapter._noKeypairError);
  }

  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (this._account) {
      transactions.forEach((trx) => trx.partialSign(this._account as Signer));

      return Promise.resolve(transactions);
    }

    return Promise.reject(MnemonicAdapter._noKeypairError);
  }

  @notImplemented()
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    return Promise.resolve(message);
  }

  async disconnect(): Promise<void> {
    this._account = null;
    this.emit('disconnect');

    await this._removeLocalAuthData();

    return Promise.resolve();
  }

  get publicKey(): PublicKey | null {
    return this._account?.publicKey || null;
  }

  get readyState(): WalletReadyState {
    return this._readyState;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  async connect(config?: ConnectConfig): Promise<void> {
    try {
      if (config?.type === 'sign') {
        const keyPair = getKeyPairFromSeed(
          config.storageInfo.seed,
          MnemonicAdapter.walletIndex,
          config.derivationPath,
        );

        const signer = {
          publicKey: new PublicKey(keyPair.publicKey),
          secretKey: keyPair.secretKey,
        };

        this._account = signer;
        this.emit('connect', signer.publicKey);

        await this._saveCurrentSecretKey(signer.secretKey);

        await MnemonicAdapter._saveEncryptedMnemonicAndSeed(config.storageInfo);
      }

      if (config?.type === 'recur') {
        this._account = config.signer;
        this.emit('connect', config.signer.publicKey);
      }

      // eslint-disable-next-line
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  private static async _saveEncryptedMnemonicAndSeed(payload: StorageInfo) {
    const plaintext = JSON.stringify({
      mnemonic: payload.mnemonic,
      seed: payload.seed,
    });
    const locked = await MnemonicAdapter._generateEncryptedTextAsync(plaintext, payload.password);

    setStorageValue(MnemonicAdapter._mnemonicStorageKey, JSON.stringify(locked));
  }

  private async _saveCurrentSecretKey(secretKey: Uint8Array) {
    const keyPair = await this._getKeyPair();

    const ciphertext = await window.crypto.subtle.encrypt(
      this._encryptAlgo,
      keyPair.publicKey as CryptoKey,
      secretKey,
    );

    if (ciphertext) {
      const cipherString = Buffer.from(ciphertext).toString('hex');

      localStorage.setItem(MnemonicAdapter._privateStorageKey, cipherString);
    }
  }

  private static async _deriveEncryptionKey(
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

  private static async _generateEncryptedTextAsync(plaintext: string, password: string) {
    const salt = nacl.randomBytes(16);
    const kdf = 'pbkdf2';
    const iterations = 100000;
    const digest = 'sha256';

    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const key = await MnemonicAdapter._deriveEncryptionKey(password, salt, iterations, digest);
    const encrypted = nacl.secretbox(Buffer.from(plaintext), nonce, key);

    return {
      encrypted: bs58.encode(encrypted),
      nonce: bs58.encode(nonce),
      kdf,
      salt: bs58.encode(salt),
      iterations,
      digest,
    };
  }

  private async _removeLocalAuthData(): Promise<void> {
    localStorage.removeItem(MnemonicAdapter._privateStorageKey);
    localStorage.removeItem(MnemonicAdapter._mnemonicStorageKey);

    const db = await this._getDB();

    await db.delete(STORE_NAME, KEYPAIR_KEY);
  }

  private async _getKeyPair(): Promise<CryptoKeyPair> {
    this._keypairDB = await getDB();

    let keypair = await this._keypairDB.get(STORE_NAME, KEYPAIR_KEY);

    if (keypair) {
      return keypair;
    }

    keypair = await window.crypto.subtle.generateKey(
      {
        name: this._encryptAlgo,
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      this._extractableKeys,
      ['encrypt', 'decrypt'],
    );

    await this._keypairDB.put(STORE_NAME, keypair, KEYPAIR_KEY);

    return keypair;
  }

  private async _getDB(): Promise<KeyPairDbInstance> {
    if (this._keypairDB) {
      return this._keypairDB;
    }

    return await getDB();
  }
}
