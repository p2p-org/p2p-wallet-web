import type { TokenAmount } from '@saberhq/token-utils';

import type { ParsedConfirmedTransaction, ParsedInstruction } from '../../../../../types';
import { getFirstProgram } from '../../utils/getFirstProgram';
import type { AbstractTransaction, Parser, TransactionDetails } from '../types';

export class CreateAccountTransaction implements AbstractTransaction {
  constructor(public fee: TokenAmount | null, public newAccount?: string) {}

  details(_sources?: string[]): TransactionDetails {
    return {
      type: 'createAccount',
      icon: 'wallet',
      isReceiver: false,
    };
  }
}

export class CreateAccountParser implements Parser {
  /**
   Check if transaction is create account transaction
   */
  static can(instructions: ParsedInstruction[]) {
    switch (instructions.length) {
      case 1:
        return instructions[0]?.program === 'spl-associated-token-account';
      case 2:
        return (
          instructions[0]?.parsed?.type === 'createAccount' &&
          instructions.at(-1)?.parsed?.type === 'initializeAccount'
        );
      default:
        return false;
    }
  }

  static parse(transactionInfo: ParsedConfirmedTransaction): CreateAccountTransaction {
    const instructions = transactionInfo.transaction.message.instructions;

    const program = getFirstProgram(instructions, 'spl-associated-token-account');
    if (program) {
      return new CreateAccountTransaction(null, program.parsed?.info.account);
    }

    const info = instructions[0]?.parsed?.info;
    // let initializeAccountInfo = instructions.at(-1)?.parsed?.info

    return new CreateAccountTransaction(info?.lamports, info?.newAccount);
  }
}
