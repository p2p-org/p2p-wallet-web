import type { FeeAmount, SolanaSDK, TransactionInfo } from 'new/sdk/SolanaSDK';
import { TokensRepository } from 'new/sdk/SolanaSDK';

import type { FeeParseStrategy } from './FeeParseStrategy';
import { DefaultFeeParseStrategy } from './FeeParseStrategy';
import type { ParsedTransactionInfoType } from './model/ParsedTransaction';
import { ParsedTransaction, Status } from './model/ParsedTransaction';
import type { Configuration, TransactionParserService } from './TransactionParserService';
import type { TransactionParseStrategy } from './TransactionParseStrategy';
import {
  CloseAccountParseStrategy,
  CreationAccountParseStrategy,
  OrcaSwapParseStrategy,
  P2POrcaSwapWrapperParseStrategy,
  SerumSwapParseStrategy,
  TransferParseStrategy,
} from './TransactionParseStrategy';

/// A default implementation of parser service.
export class TransactionParserServiceImpl implements TransactionParserService {
  strategies: TransactionParseStrategy[];
  feeParserStrategy: FeeParseStrategy;

  constructor({
    strategies,
    feeParserStrategy,
  }: {
    strategies: TransactionParseStrategy[];
    feeParserStrategy: FeeParseStrategy;
  }) {
    this.strategies = strategies;
    this.feeParserStrategy = feeParserStrategy;
  }

  static default({ apiClient }: { apiClient: SolanaSDK }): TransactionParserServiceImpl {
    const tokensRepository = new TokensRepository({ endpoint: apiClient.endpoint });

    return new TransactionParserServiceImpl({
      strategies: [
        new OrcaSwapParseStrategy({ apiClient, tokensRepository }),
        new P2POrcaSwapWrapperParseStrategy({ tokensRepository }),
        new SerumSwapParseStrategy({ tokensRepository }),
        new CreationAccountParseStrategy({ tokensRepository }),
        new CloseAccountParseStrategy({ tokensRepository }),
        new TransferParseStrategy({ apiClient, tokensRepository }),
      ],
      feeParserStrategy: new DefaultFeeParseStrategy({ apiClient }),
    });
  }

  async parse({
    transactionInfo,
    config,
  }: {
    transactionInfo: TransactionInfo;
    config: Configuration;
  }): Promise<ParsedTransaction> {
    let status = Status.confirmed();

    if (transactionInfo.meta?.err) {
      const errorMessage = transactionInfo.meta.logMessages
        ?.find((log) => log.includes('Program log: Error:'))
        ?.replace('Program log: Error: ', '');
      status = Status.error(errorMessage);
    }

    const [info, fee] = await Promise.all([
      this._parseTransaction({ transactionInfo, config }),
      this._parseFee({ transactionInfo, config }),
    ]);

    return new ParsedTransaction({
      status,
      signature: transactionInfo.transaction.signatures[0], // TODO
      info,
      slot: transactionInfo.slot,
      blockTime: transactionInfo.blockTime ? new Date(transactionInfo.blockTime * 1000) : null,
      fee,
      blockhash: transactionInfo.transaction.message.recentBlockhash,
    });
  }

  /// Algorithm for choosing strategy
  ///
  /// The picking is depends on order of strategies. If strategy has been chosen, but it can't parse the transaction, the next strategy will try to parse.
  private async _parseTransaction({
    transactionInfo,
    config,
  }: {
    transactionInfo: TransactionInfo;
    config: Configuration;
  }): Promise<ParsedTransactionInfoType | null> {
    for (const strategy of this.strategies) {
      if (strategy.isHandlable(transactionInfo)) {
        const info = await strategy.parse({ transactionInfo, config });
        if (!info) {
          continue;
        }
        return info;
      }
    }

    return null;
  }

  private _parseFee({
    transactionInfo,
    config,
  }: {
    transactionInfo: TransactionInfo;
    config: Configuration;
  }): Promise<FeeAmount> {
    return this.feeParserStrategy.calculate({ transactionInfo, feePayers: config.feePayers });
  }
}
