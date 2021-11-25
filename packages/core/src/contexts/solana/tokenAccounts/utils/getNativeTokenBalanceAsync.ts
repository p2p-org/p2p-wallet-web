import type { Connection, PublicKey } from '@solana/web3.js';

export const getNativeTokenBalanceAsync = async (
  ownerAddress: PublicKey,
  connection: Connection,
) => {
  const result = await connection.getAccountInfo(ownerAddress);
  return result ? result.lamports : 0;
};
