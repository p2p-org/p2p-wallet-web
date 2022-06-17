import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Secp256k1Program } from '@solana/web3.js';

import type {
  ParsedConfirmedTransaction,
  ParsedInnerInstruction,
  ParsedInstruction,
} from '../../../../../types';
import type { Parser } from '../types';
import { REN_BTC_MINT } from './const';
import { RenBTCTransaction } from './RenBTCTransaction';

export class RentBTCMintParser implements Parser {
  /**
   Check if transaction is renBTC mint transaction
   */
  static can(
    instructions: ParsedInstruction[],
    innerInstructions?: ParsedInnerInstruction[] | null,
  ) {
    if (
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      instructions.length === 2 &&
      instructions?.[1]?.programId.equals(Secp256k1Program.programId)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      if (innerInstructions?.length === 1 && innerInstructions?.[0]?.instructions.length === 4) {
        const instruction = innerInstructions?.[0]?.instructions[3];

        if (instruction?.programId.equals(TOKEN_PROGRAM_ID)) {
          const parsedInstruction = instruction.parsed;
          if (
            parsedInstruction?.type === 'mintToChecked' &&
            REN_BTC_MINT.includes(parsedInstruction?.info.mint)
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  static parse(transactionInfo: ParsedConfirmedTransaction): RenBTCTransaction {
    const parsedInstruction =
      transactionInfo?.meta?.innerInstructions?.[0]?.instructions[3]?.parsed;

    const type = 'mintRenBTC';
    const icon = 'bottom';
    const isReceiver = true;
    const sourceAmount = parsedInstruction?.info?.tokenAmount?.amount || '0';
    const tokenAccountAddress = parsedInstruction?.info?.account || '';

    return new RenBTCTransaction(type, icon, isReceiver, sourceAmount, tokenAccountAddress);
  }
}
