import { useMemo } from 'react';

import { TOKEN_PROGRAM_ID } from 'constants/solana/bufferLayouts';
import { decodeTokenInstructionData } from 'store/utils/instructions/tokenProgram';

export const useDecodeTokenRegInstructions = (instructions) =>
  useMemo(() => {
    if (instructions) {
      const [instruction] = instructions;
      if (instruction.programId.toBase58() === TOKEN_PROGRAM_ID.toBase58()) {
        return decodeTokenInstructionData(instruction.data);
      }
    }

    return {};
  }, [instructions]);
