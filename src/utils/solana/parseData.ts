import * as web3 from '@solana/web3.js';

import { ACCOUNT_LAYOUT } from 'constants/solana/bufferLayouts';

export function parseTokenAccountData(
  data: Buffer,
): {
  mint: web3.PublicKey;
  owner: web3.PublicKey;
  amount: number;
} {
  const { mint, owner, amount } = ACCOUNT_LAYOUT.decode(data);

  return {
    mint: new web3.PublicKey(mint),
    owner: new web3.PublicKey(owner),
    amount,
  };
}
