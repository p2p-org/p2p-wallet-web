import type {
  ParsedConfirmedTransaction,
  ParsedInnerInstruction,
  ParsedInstruction,
} from '../../../../types';

export type ParsedInstructionData = {
  instruction: ParsedInstruction;
  innerInstruction?: ParsedInnerInstruction;
};

export const instructionsData = (
  transactionInfo: ParsedConfirmedTransaction,
): ParsedInstructionData[] => {
  const instructions = transactionInfo.transaction.message.instructions;
  const innerInstructions = transactionInfo.meta?.innerInstructions ?? [];

  return instructions.map(
    (instruction, index) =>
      <ParsedInstructionData>{
        instruction,
        innerInstruction: innerInstructions.find(
          (innerInstruction) => innerInstruction.index === index,
        ),
      },
  );
};
