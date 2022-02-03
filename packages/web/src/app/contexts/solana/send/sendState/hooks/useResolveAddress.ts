import { useCallback } from 'react';

import type { Token } from '@saberhq/token-utils';
import { useConnectionContext } from '@saberhq/use-solana';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token as SPLToken,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import type { AccountInfo, Connection, PublicKey } from '@solana/web3.js';

const accounsInfoCache: { [key: string]: AccountInfo<Buffer> | null } = {};

const isTokenAccountExist = async (connection: Connection, address: PublicKey) => {
  const pubkey = address.toBase58();
  const account =
    pubkey in accounsInfoCache
      ? accounsInfoCache[pubkey]
      : await connection.getAccountInfo(address);

  if (account && account.owner.equals(TOKEN_PROGRAM_ID)) {
    accounsInfoCache[pubkey] = account;
    return true;
  }

  return false;
};

export type ResolvedAddress = {
  address: PublicKey;
  owner?: PublicKey;
  needCreateATA?: boolean;
};

export const useResolveAddress = () => {
  const { connection } = useConnectionContext();

  const resolveAddress = useCallback(
    async (owner: PublicKey, token: Token): Promise<ResolvedAddress> => {
      if (await isTokenAccountExist(connection, owner)) {
        return {
          address: owner,
        };
      }

      const associatedTokenAddress = await SPLToken.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        token.mintAccount,
        owner,
      );

      if (await isTokenAccountExist(connection, associatedTokenAddress)) {
        return { address: associatedTokenAddress, owner };
      }

      return { address: associatedTokenAddress, owner, needCreateATA: true };
    },
    [connection],
  );

  return { resolveAddress };
};
