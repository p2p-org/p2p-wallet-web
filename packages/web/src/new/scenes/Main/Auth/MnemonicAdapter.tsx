// @TODO might not need this decorator
import type { WalletName } from '@solana/wallet-adapter-base';
import { BaseMessageSignerWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import type { PublicKey, Signer, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { pbkdf2 } from 'crypto';
import nacl from 'tweetnacl';

import type { ConnectConfig, StorageInfo } from 'new/scenes/Main/Auth/typings';
import { setStorageValue } from 'new/scenes/Main/Auth/utils';

export interface Wallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}

export class MnemonicAdapter extends BaseMessageSignerWalletAdapter {
  name = 'MnemonicWallet' as WalletName;
  icon = '';
  url = '';
  private _account: Signer | null = null;
  private _connecting = false;
  private _readyState = WalletReadyState.NotDetected;
  private static _noKeypairError = 'No keypair to sign transactions';
  private static _storageKey = 'encryptedSeedAndMnemonic';

  constructor() {
    super();
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (this._account) {
      transaction.partialSign(this._account);

      return Promise.resolve(transaction);
    }

    return Promise.reject(MnemonicAdapter._noKeypairError);
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (this._account) {
      transactions.forEach((trx) => trx.partialSign(this._account as Signer));

      return Promise.resolve(transactions);
    }

    return Promise.reject(MnemonicAdapter._noKeypairError);
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    return Promise.resolve(message);
  }

  async disconnect(): Promise<void> {
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
    try {
      if (config?.signer) {
        this._account = config.signer;
        this.emit('connect', config.signer.publicKey);

        await MnemonicAdapter._saveEncryptedMnemonicAndSeed(config.storageInfo);
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

    setStorageValue(MnemonicAdapter._storageKey, JSON.stringify(locked));
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
}
