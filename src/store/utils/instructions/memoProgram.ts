import * as web3 from '@solana/web3.js';

import { MEMO_PROGRAM_ID } from 'constants/solana/bufferLayouts';

export function memoInstruction(memo: string) {
  return new web3.TransactionInstruction({
    keys: [],
    data: Buffer.from(memo, 'utf-8'),
    programId: MEMO_PROGRAM_ID,
  });
}
