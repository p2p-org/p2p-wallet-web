import type { ParsedConfirmedTransaction, ParsedInstruction } from '../../../../../types';
import type { AbstractTransaction, Parser, TransactionDetails } from '../types';

export class CloseAccountTransaction implements AbstractTransaction {
  constructor(
    public reimbursedAmount?: number,
    public closedAccount?: string,
    public mint?: string,
  ) {}

  details(sources?: string[]): TransactionDetails {
    const isReceiver = this.closedAccount ? sources?.includes(this.closedAccount) : false;
    return {
      type: 'closeAccount',
      icon: 'bucket',
      isReceiver,
    };
  }
}

export class CloseAccountParser implements Parser {
  /**
   Check if transaction is close account transaction
   */
  static can(instructions: ParsedInstruction[]) {
    switch (instructions.length) {
      case 1:
        return instructions[0]?.parsed?.type === 'closeAccount';
      default:
        return false;
    }
  }

  static parse(transactionInfo: ParsedConfirmedTransaction): CloseAccountTransaction {
    const instructions = transactionInfo.transaction.message.instructions;
    const closedAccount = instructions[0]?.parsed?.info.account;
    const preBalances = transactionInfo.meta?.preBalances;
    const preTokenBalance = transactionInfo.meta?.preTokenBalances?.[0];

    let reimbursedAmount: number | undefined;

    if (preBalances?.length && preBalances?.length > 1) {
      reimbursedAmount = preBalances[1];
    }

    return new CloseAccountTransaction(reimbursedAmount, closedAccount, preTokenBalance?.mint);
  }
}
