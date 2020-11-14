import { useMemo } from 'react';

import * as web3 from '@solana/web3.js';

export const useDecodeSystemProgramInstructions = (instructions) => {
  const { type, fromPubkey, lamports, toPubkey } = useMemo(() => {
    // eslint-disable-next-line no-shadow
    let type;
    // eslint-disable-next-line no-shadow
    let fromPubkey;
    // eslint-disable-next-line no-shadow
    let lamports;
    // eslint-disable-next-line no-shadow
    let toPubkey;

    if (instructions) {
      const [instruction] = instructions;
      if (instruction.programId.toBase58() === web3.SystemProgram.programId.toBase58()) {
        type = web3.SystemInstruction.decodeInstructionType(instruction);

        switch (type) {
          case 'Create':
            ({ fromPubkey, lamports } = web3.SystemInstruction.decodeCreateAccount(instruction));
            break;
          case 'Transfer':
            ({ fromPubkey, lamports, toPubkey } = web3.SystemInstruction.decodeTransfer(
              instruction,
            ));
            break;
          default:
            break;
        }
      }
    }

    return { type, fromPubkey, lamports, toPubkey };
  }, [instructions]);

  return { type, fromPubkey, lamports, toPubkey };
};
