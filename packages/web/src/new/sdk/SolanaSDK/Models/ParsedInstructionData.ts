import type { ParsedInstruction } from './ConfirmedTransaction';
import type { InnerInstruction, TransactionInfo } from './Models';

export type ParsedInstructionData = {
  instruction: ParsedInstruction;
  innerInstruction?: InnerInstruction;
};

export const instructionsData = (transactionInfo: TransactionInfo): ParsedInstructionData[] => {
  const instructions = transactionInfo.transaction.message.instructions;
  const innerInstructions = transactionInfo.meta?.innerInstructions ?? [];

  return instructions.map((instruction, index) => ({
    instruction,
    innerInstruction: innerInstructions.find((inst) => inst.index === index),
  }));
};
