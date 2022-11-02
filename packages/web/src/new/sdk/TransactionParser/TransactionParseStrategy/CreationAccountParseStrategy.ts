import { u64 } from '@solana/spl-token';

import type { ParsedInstruction, SolanaTokensRepository, TransactionInfo } from 'new/sdk/SolanaSDK';
import { convertToBalance, Wallet } from 'new/sdk/SolanaSDK';
import { Decimals } from 'new/sdk/SolanaSDK/extensions/DecimalsExtensions';
import type { Configuration } from 'new/sdk/TransactionParser';
import { CreateAccountInfo } from 'new/sdk/TransactionParser';

import type { ParsedTransactionInfoType } from '../model/ParsedTransaction';
import type { TransactionParseStrategy } from './TransactionParseStrategy';

/// The strategy for parsing creation account transactions.
export class CreationAccountParseStrategy implements TransactionParseStrategy {
  private _tokensRepository: SolanaTokensRepository;

  constructor({ tokensRepository }: { tokensRepository: SolanaTokensRepository }) {
    this._tokensRepository = tokensRepository;
  }

  isHandlable(transactionInfo: TransactionInfo): boolean {
    const instructions = transactionInfo.transaction.message.instructions;
    switch (instructions.length) {
      case 1:
        return (
          instructions[0]!.program === 'spl-associated-token-account' ||
          instructions[0]!.parsed?.type === 'create'
        );
      case 2:
        if (instructions[0]!.parsed?.type === 'create') {
          return true;
        } else if (
          instructions[0]!.parsed?.type === 'createAccount' &&
          instructions.at(-1)!.parsed?.type === 'initializeAccount'
        ) {
          return true;
        }
        return false;
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

    const program = this._extractProgram({ instructions, name: 'spl-associated-token-account' });
    if (program) {
      const token = await this._tokensRepository.getTokenWithMint(program.parsed?.info.mint);
      return new CreateAccountInfo({
        fee: null,
        newWallet: new Wallet({
          pubkey: program.parsed?.info.account,
          token,
        }),
      });
    } else {
      const info = instructions[0]?.parsed?.info;
      const initializeAccountInfo = instructions.at(-1)?.parsed?.info;
      const fee = info?.lamports ? convertToBalance(new u64(info.lamports), Decimals.SOL) : null;

      const token = await this._tokensRepository.getTokenWithMint(initializeAccountInfo?.mint);
      return new CreateAccountInfo({
        fee,
        newWallet: new Wallet({
          pubkey: info?.newAccount,
          lamports: null,
          token,
        }),
      });
    }
  }

  private _extractProgram({
    instructions,
    name,
  }: {
    instructions: ParsedInstruction[];
    name: string;
  }): ParsedInstruction | undefined {
    return instructions.find((inst) => inst.program === name);
  }
}
