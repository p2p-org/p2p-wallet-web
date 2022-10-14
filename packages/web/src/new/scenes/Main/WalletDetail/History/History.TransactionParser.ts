import type { ConfirmedSignatureInfo, ConfirmedTransaction } from '@solana/web3.js';

import { SolanaSDKError } from 'new/sdk/SolanaSDK';
import type { ParsedTransaction } from 'new/sdk/TransactionParser';

interface HistoryTransactionParser {
  ///  Parse transaction.
  ///
  /// - Parameters:
  ///   - signatureInfo: the raw signature info
  ///   - transactionInfo: the raw transaction info
  ///   - account: the account that the transaction info belongs to.
  ///   - symbol: the token symbol that the transaction has to do.
  /// - Returns: parsed transaction
  parse(
    signatureInfo: ConfirmedSignatureInfo, // @ios: SignatureInfo
    transactionInfo?: ConfirmedTransaction, // @ios: TransactionInfo
    account?: string,
    symbol?: string,
  ): Promise<ParsedTransaction>;
}

type TransactionParser = HistoryTransactionParser;

/// The default transaction parser.
class DefaultTransactionParser implements TransactionParser {
  private _p2pFeePayers: string[];
  private _parser: TransactionParserService;

  constructor(p2pFeePayers: string[]) {
    this._p2pFeePayers = p2pFeePayers;
    this._parser = TransactionParserServiceImpl.default({
      apiClient: resolve,
    });
  }

  async parse({
    signatureInfo,
    transactionInfo,
    account,
    symbol,
  }: {
    signatureInfo: ConfirmedSignatureInfo;
    transactionInfo?: ConfirmedTransaction;
    account?: string;
    symbol?: string;
  }): Promise<ParsedTransaction> {
    try {
      if (!transactionInfo) {
        throw SolanaSDKError.other('TransactionInfo is nil');
      }

      const parsedTrx = await this._parser.pa;
    } catch {}
  }
}
