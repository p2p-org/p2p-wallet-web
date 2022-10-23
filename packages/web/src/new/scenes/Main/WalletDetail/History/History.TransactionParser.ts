import type { ConfirmedSignatureInfo } from '@solana/web3.js';

import type { SolanaSDK, TransactionInfo } from 'new/sdk/SolanaSDK';
import { SolanaSDKError } from 'new/sdk/SolanaSDK';
import type { TransactionParserService } from 'new/sdk/TransactionParser';
import { ParsedTransaction, Status, TransactionParserServiceImpl } from 'new/sdk/TransactionParser';

interface HistoryTransactionParser {
  ///  Parse transaction.
  ///
  /// - Parameters:
  ///   - signatureInfo: the raw signature info
  ///   - transactionInfo: the raw transaction info
  ///   - account: the account that the transaction info belongs to.
  ///   - symbol: the token symbol that the transaction has to do.
  /// - Returns: parsed transaction
  parse({
    signatureInfo,
    transactionInfo,
    account,
    symbol,
  }: {
    signatureInfo: ConfirmedSignatureInfo; // @ios: SignatureInfo
    transactionInfo?: TransactionInfo;
    account?: string;
    symbol?: string;
  }): Promise<ParsedTransaction>;
}

export type TransactionParser = HistoryTransactionParser;

/// The default transaction parser.
export class DefaultTransactionParser implements TransactionParser {
  private _p2pFeePayers: string[];
  private _parser: TransactionParserService;

  constructor({
    p2pFeePayers,
    solanaAPIClient,
  }: {
    p2pFeePayers: string[];
    solanaAPIClient: SolanaSDK;
  }) {
    this._p2pFeePayers = p2pFeePayers;
    this._parser = TransactionParserServiceImpl.default({
      apiClient: solanaAPIClient,
    });
  }

  async parse({
    signatureInfo,
    transactionInfo,
    account,
    symbol,
  }: {
    signatureInfo: ConfirmedSignatureInfo;
    transactionInfo?: TransactionInfo | null;
    account?: string;
    symbol?: string;
  }): Promise<ParsedTransaction> {
    try {
      if (!transactionInfo) {
        throw SolanaSDKError.other('TransactionInfo is nil');
      }

      const parsedTrx = await this._parser.parse({
        transactionInfo,
        config: {
          accountView: account,
          symbolView: symbol,
          feePayers: this._p2pFeePayers,
        },
      });

      const time = transactionInfo.blockTime ? new Date(transactionInfo.blockTime * 1000) : null;

      return new ParsedTransaction({
        status: parsedTrx.status,
        signature: signatureInfo.signature,
        info: parsedTrx.info,
        slot: transactionInfo.slot,
        blockTime: time,
        fee: parsedTrx.fee,
        blockhash: parsedTrx.blockhash,
      });
    } catch {
      const blockTime = signatureInfo.blockTime ? new Date(signatureInfo.blockTime * 1000) : null;
      return new ParsedTransaction({
        status: Status.confirmed(),
        signature: signatureInfo.signature,
        info: null,
        slot: signatureInfo.slot,
        blockTime,
        fee: null,
        blockhash: null,
      });
    }
  }
}

export class CachingTransactionParsing implements TransactionParser {
  private _delegate: TransactionParser;
  private _cache = new InMemoryCache<ParsedTransaction>(50);

  constructor(delegate: TransactionParser) {
    this._delegate = delegate;
  }

  async parse({
    signatureInfo,
    transactionInfo,
    account,
    symbol,
  }: {
    signatureInfo: ConfirmedSignatureInfo;
    transactionInfo?: TransactionInfo;
    account?: string;
    symbol?: string;
  }): Promise<ParsedTransaction> {
    // Read from cache
    let parsedTransaction = this._cache.read(signatureInfo.signature);
    if (parsedTransaction) {
      return parsedTransaction;
    }

    // Parse
    parsedTransaction = await this._delegate.parse({
      signatureInfo,
      transactionInfo,
      account,
      symbol,
    });
    this._cache.write(signatureInfo.signature, parsedTransaction);
    return parsedTransaction;
  }
}
