import { unstable_batchedUpdates } from 'react-dom';

import type { AccountLoader, AccountsCache } from '@p2p-wallet-web/sail';
import { getCacheKeyOfPublicKey } from '@p2p-wallet-web/sail';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { Connection, PublicKey } from '@solana/web3.js';

export const precacheUserTokenAccounts = async (
  connection: Connection,
  loader: AccountLoader,
  accountsCache: AccountsCache,
  owner: PublicKey,
): Promise<{ keys: PublicKey[]; ownerPublicKey: PublicKey }> => {
  const filters = {
    programId: TOKEN_PROGRAM_ID,
  };

  const accounts = await connection.getTokenAccountsByOwner(owner, filters);

  unstable_batchedUpdates(() => {
    accounts.value.forEach((info) => {
      // Cache in loader
      loader.prime(info.pubkey, info.account);
      // Cache in sail
      accountsCache.set(getCacheKeyOfPublicKey(info.pubkey), info.account);
      return info.pubkey;
    });
  });

  return {
    keys: accounts.value.map((info) => info.pubkey),
    ownerPublicKey: owner,
  };
};
