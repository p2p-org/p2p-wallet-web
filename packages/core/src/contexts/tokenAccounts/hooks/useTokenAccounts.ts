import { useMemo } from 'react';

import { TOKEN_ACCOUNT_PARSER, useAccountsData } from '@p2p-wallet-web/sail';
import { RAW_SOL_MINT, TokenAmount } from '@saberhq/token-utils';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';
import { zip } from 'ramda';

import { SYSTEM_PROGRAM_ID } from '../../../constants/publicKeys';
import type { TokenAccount } from '../models';
import { useWallet } from '@saberhq/use-solana';
import { useTokens } from '../../tokens';

export const useTokenAccounts = (
  publicKeys: (PublicKey | null | undefined)[] = [],
): (TokenAccount | undefined)[] => {
  const { publicKey } = useWallet();
  const tokenAccountsData = useAccountsData(publicKeys);

  const mints = useMemo(() => {
    return tokenAccountsData.map((datum, i) => {
      if (!datum) {
        // Use wallet Native SOL if its zero
        if (publicKey && publicKeys[i] && publicKey.equals(publicKeys[i]!)) {
          return RAW_SOL_MINT;
        }

        return datum;
      }

      // Native SOL
      if (datum.accountInfo.owner.equals(SYSTEM_PROGRAM_ID)) {
        return RAW_SOL_MINT;
      }

      if (datum.accountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
        return TOKEN_ACCOUNT_PARSER(datum).mint;
      }

      return null;
    });
  }, [tokenAccountsData]);

  const tokens = useTokens(mints);

  return useMemo(() => {
    return zip(tokenAccountsData, tokens).map(([datum], i) => {
      const tokenAccountKey = publicKeys[i];
      if (!tokenAccountKey) {
        return {
          key: undefined,
          loading: false,
          balance: undefined,
          isInitialized: !!datum,
        };
      }

      const token = tokens[i];
      if (!token) {
        return {
          key: tokenAccountKey,
          loading: token === undefined,
          balance: undefined,
          isInitialized: !!datum,
        };
      }

      // Native SOL
      if (datum?.accountInfo.owner.equals(SYSTEM_PROGRAM_ID)) {
        return {
          key: tokenAccountKey,
          loading: false,
          balance: new TokenAmount(token, datum.accountInfo.lamports),
          isInitialized: true,
        };
      }

      const parsed = datum ? TOKEN_ACCOUNT_PARSER(datum) : datum;
      try {
        return {
          key: tokenAccountKey,
          loading: datum === undefined,
          balance: parsed ? new TokenAmount(token, parsed.amount) : new TokenAmount(token, 0),
          isInitialized: !!datum,
        };
      } catch (e) {
        console.warn(`Error parsing ATA ${datum?.accountId.toString() ?? '(unknown)'}`, e);
        return undefined;
      }
    });
  }, [publicKeys, tokenAccountsData, tokens]);
};
