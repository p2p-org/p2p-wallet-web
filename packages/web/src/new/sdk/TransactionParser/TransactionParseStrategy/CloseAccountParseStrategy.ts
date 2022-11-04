import { u64 } from '@solana/spl-token';

import type { Lamports, SolanaTokensRepository, TransactionInfo } from 'new/sdk/SolanaSDK';
import { convertToBalance, Wallet } from 'new/sdk/SolanaSDK';
import { Decimals } from 'new/sdk/SolanaSDK/extensions/DecimalsExtensions';
import { CloseAccountInfo } from 'new/sdk/TransactionParser';

import type { ParsedTransactionInfoType } from '../model/ParsedTransaction';
import type { Configuration } from '../TransactionParserService';
import type { TransactionParseStrategy } from './TransactionParseStrategy';

/// A strategy for parsing close transactions.
export class CloseAccountParseStrategy implements TransactionParseStrategy {
  private _tokensRepository: SolanaTokensRepository;

  constructor({ tokensRepository }: { tokensRepository: SolanaTokensRepository }) {
    this._tokensRepository = tokensRepository;
  }

  isHandlable(transactionInfo: TransactionInfo): boolean {
    const instructions = transactionInfo.transaction.message.instructions;
    switch (instructions.length) {
      case 1:
        return instructions[0]?.parsed?.type === 'closeAccount';
      default:
        return false;
    }
  }

  async parse({
    transactionInfo, // config,
  }: {
    transactionInfo: TransactionInfo;
    config: Configuration;
  }): Promise<ParsedTransactionInfoType | null> {
    const instructions = transactionInfo.transaction.message.instructions;
    const closedTokenPubkey = instructions[0]?.parsed?.info.account;
    const preBalances = transactionInfo.meta?.preBalances;
    const preTokenBalance = transactionInfo.meta?.preTokenBalances?.[0];

    let reimbursedAmountLamports: Lamports | undefined;

    if ((preBalances?.length ?? 0) > 1) {
      reimbursedAmountLamports = new u64(preBalances![1]!);
    }

    const reimbursedAmount = reimbursedAmountLamports
      ? convertToBalance(reimbursedAmountLamports, Decimals.SOL)
      : null;
    const token = await this._tokensRepository.getTokenWithMint(preTokenBalance?.mint);

    return new CloseAccountInfo({
      reimbursedAmount,
      closedWallet: new Wallet({
        pubkey: closedTokenPubkey,
        lamports: null,
        token,
      }),
    });
  }
}
