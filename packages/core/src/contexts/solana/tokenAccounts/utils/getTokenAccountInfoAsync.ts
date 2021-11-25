import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { Connection, PublicKey } from '@solana/web3.js';

import { deserializeAccount, TokenAccount } from '../models/TokenAccount';

export const getTokenAccountInfoAsync = async (
  ownerAddress: PublicKey,
  connection: Connection,
): Promise<TokenAccount[]> => {
  const filter = {
    programId: TOKEN_PROGRAM_ID,
  };

  const response = await connection.getTokenAccountsByOwner(ownerAddress, filter, 'single');

  return response.value.map(({ pubkey, account }) => {
    const accountInfo = deserializeAccount(pubkey, account.data);

    return new TokenAccount(pubkey, accountInfo);
  });
};
