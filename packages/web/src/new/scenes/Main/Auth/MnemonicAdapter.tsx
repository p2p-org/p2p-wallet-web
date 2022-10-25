// @TODO might not need this decorator
import type { WalletName } from '@solana/wallet-adapter-base';
import { BaseMessageSignerWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import type { Signer, Transaction } from '@solana/web3.js';
import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { pbkdf2 } from 'crypto';
import nacl from 'tweetnacl';

import type { ConnectConfig, StorageInfo } from 'new/scenes/Main/Auth/typings';
import { getKeyPairFromSeed, getStorageValue, setStorageValue } from 'new/scenes/Main/Auth/utils';
import { notImplemented } from 'new/utils/decorators';

export interface Wallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}

export class MnemonicAdapter extends BaseMessageSignerWalletAdapter {
  name = 'MnemonicAdapter' as WalletName;
  icon = '';
  url = '';
  private _account: Signer | null = null;
  private _connecting = false;
  private _readyState = WalletReadyState.NotDetected;

  static walletIndex = 0;
  static mnemonicStrength = 256;

  private static _noKeypairError = 'No keypair to sign transactions';
  private static _mnemonicStorageKey = 'encryptedSeedAndMnemonic';
  private static _privateStorageKey = 'walletPrivateKey';

  constructor() {
    super();
  }

  static getLocalSigner(): Signer | null {
    const secretKeyStored = getStorageValue<Uint8Array>(MnemonicAdapter._privateStorageKey);

    if (secretKeyStored) {
      const secretKey = Uint8Array.from(Object.values(secretKeyStored));
      const keyPair = Keypair.fromSecretKey(secretKey);

      return {
        publicKey: new PublicKey(keyPair.publicKey),
        secretKey: keyPair.secretKey,
      };
    }

    return null;
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

    MnemonicAdapter._removeLocalAuthData();

    return Promise.resolve();
  }

  get publicKey(): PublicKey | null {
    return this._account?.publicKey || null;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get readyState(): WalletReadyState {
    return this._readyState;
  }

  async connect(config?: ConnectConfig): Promise<void> {
    this._connecting = true;

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

        MnemonicAdapter._saveCurrentSecretKey(signer.secretKey);

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
    } finally {
      this._connecting = false;
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

  private static _saveCurrentSecretKey(secretKey: Uint8Array) {
    setStorageValue(MnemonicAdapter._privateStorageKey, secretKey);
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

  private static _removeLocalAuthData(): void {
    localStorage.removeItem(MnemonicAdapter._privateStorageKey);
    localStorage.removeItem(MnemonicAdapter._mnemonicStorageKey);
  }
}