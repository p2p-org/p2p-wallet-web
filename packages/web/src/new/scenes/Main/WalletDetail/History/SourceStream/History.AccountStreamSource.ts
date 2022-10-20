import type { ConfirmedSignatureInfo } from '@solana/web3.js';

import type { HistoryTransactionRepository } from '../History.Repository';
import type { TransactionParser } from '../History.TransactionParser';
import type { FetchingConfiguration, Result } from './History.StreamSource';
import { HistoryStreamSource } from './History.StreamSource';

export class AccountStreamSource extends HistoryStreamSource {
  transactionRepository: HistoryTransactionRepository;

  /// The object that is responsible for parsing transactions
  transactionParser: TransactionParser;

  /// The account address
  private readonly _account: string;

  /// The account's token symbol
  private readonly _symbol: string;

  /// The most latest signature of transactions, that has been loaded.
  /// This value will be used as pagination indicator and all next transactions after this one will be loaded.
  private _latestFetchedSignature?: string;

  /// Fixed number of transactions that will be requested each time.
  private _batchSize = 15;

  /// A stream's buffer size
  // private _bufferSize = 15;

  /// A stream's buffer
  private _buffer: ConfirmedSignatureInfo[] = [];

  /// A indicator that shows emptiness of transaction.
  private _isEmpty = false;

  constructor({
    account,
    symbol,
    transactionRepository,
    transactionParser,
  }: {
    account: string;
    symbol: string;
    transactionRepository: HistoryTransactionRepository;
    transactionParser: TransactionParser;
  }) {
    super();
    this._account = account;
    this._symbol = symbol;
    this.transactionRepository = transactionRepository;
    this.transactionParser = transactionParser;
  }

  async currentItem(): Promise<Result | null> {
    if (this._buffer.length === 0) {
      await this._fillBuffer();
    }

    const signatureInfo = this._buffer[0];
    if (!signatureInfo) {
      return null;
    }
    return { signatureInfo, account: this._account, symbol: this._symbol };
  }

  async next(configuration: FetchingConfiguration): Promise<Result | null> {
    // Fetch transaction signatures
    if (this._buffer.length === 0) {
      await this._fillBuffer();
    }

    // Fetch transaction and parse it
    const signatureInfo = this._buffer[0];
    if (!signatureInfo) {
      return null;
    }

    // Setup transaction timestamp
    let transactionTime = new Date();
    const time = signatureInfo.blockTime;
    if (time) {
      transactionTime = new Date(time);
    }

    // Check transaction timestamp
    if (transactionTime >= configuration.timestampEnd) {
      this._buffer.splice(0);
      return { signatureInfo, account: this._account, symbol: this._symbol };
    }

    return null;
  }

  /// This method fills buffer of transaction.
  private async _fillBuffer(): Promise<void> {
    if (this._isEmpty) {
      return;
    }

    const newSignatures = await this.transactionRepository.getSignatures({
      address: this._account,
      limit: this._batchSize,
      before: this._latestFetchedSignature,
    });

    this._isEmpty = newSignatures.length === 0;
    this._latestFetchedSignature = newSignatures.at(-1)?.signature;
    this._buffer.push(...newSignatures);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async reset(): Promise<void> {
    this._buffer = [];
    this._latestFetchedSignature = undefined;
  }
}
