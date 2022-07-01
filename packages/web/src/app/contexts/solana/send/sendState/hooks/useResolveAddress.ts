import { useCallback } from 'react';

import type { Token } from '@saberhq/token-utils';
import { useConnectionContext } from '@saberhq/use-solana';
import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token as SPLToken,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import type { AccountInfo, Connection } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

const accounsInfoCache: { [key: string]: AccountInfo<Buffer> | null } = {};

const getTokenAccountInfo = async (
  connection: Connection,
  address: PublicKey,
): Promise<AccountInfo<Buffer> | null> => {
  const pubkey = address.toBase58();
  const account =
    pubkey in accounsInfoCache
      ? accounsInfoCache[pubkey]
      : await connection.getAccountInfo(address);

  if (account && account.owner.equals(TOKEN_PROGRAM_ID)) {
    accounsInfoCache[pubkey] = account;
    return account;
  }

  return null;
};

const isTokenAccountExist = async (connection: Connection, address: PublicKey) => {
  const accountInfo = await getTokenAccountInfo(connection, address);

  if (accountInfo) {
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
        const { data } = (await getTokenAccountInfo(connection, owner)) || {};
        const tokenAccountOwner = data ? AccountLayout.decode(data).owner : undefined;

        return {
          address: owner,
          owner: tokenAccountOwner ? new PublicKey(tokenAccountOwner) : undefined,
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
