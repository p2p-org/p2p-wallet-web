import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

import type { ParsedConfirmedTransaction, ParsedInstruction } from '../../../../../types';
import type { Parser } from '../types';
import { REN_BTC_MINT } from './const';
import { RenBTCTransaction } from './RenBTCTransaction';

export class RentBTCBurnParser implements Parser {
  /**
   Check if transaction is renBTC burn transaction
   */
  static can(instructions: ParsedInstruction[]) {
    if (
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      instructions.length === 2 &&
      instructions?.[0]?.programId.equals(TOKEN_PROGRAM_ID) &&
      instructions[0]?.parsed?.type === 'burnChecked'
    ) {
      const instruction = instructions[0];
      if (REN_BTC_MINT.includes(instruction?.parsed?.info.mint || '')) {
        return true;
      }
    }

    return false;
  }

  static parse(transactionInfo: ParsedConfirmedTransaction): RenBTCTransaction {
    const parsedInstruction = transactionInfo.transaction.message.instructions?.[0]?.parsed;

    const type = 'burnRenBTC';
    const icon = 'top';
    const isReceiver = false;
    const sourceAmount = parsedInstruction?.info?.tokenAmount?.amount || '0';
    const tokenAccountAddress = parsedInstruction?.info?.account || '';

    return new RenBTCTransaction(type, icon, isReceiver, sourceAmount, tokenAccountAddress);
  }
}
