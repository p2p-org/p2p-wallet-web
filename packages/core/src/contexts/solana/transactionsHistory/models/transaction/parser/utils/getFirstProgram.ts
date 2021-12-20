import type { ParsedInstruction } from '../../../../types';

export const getFirstProgram = (
  instructions: ParsedInstruction[],
  name: string,
): ParsedInstruction | undefined => {
  return instructions.find((inst) => inst.program === name);
};
