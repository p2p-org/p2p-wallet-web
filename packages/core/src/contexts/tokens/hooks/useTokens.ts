import { useMemo } from 'react';

import { MINT_PARSER, useParsedAccountsData } from '@p2p-wallet-web/sail';
import { networkToChainId, Token } from '@saberhq/token-utils';
import { useSolana } from '@saberhq/use-solana';
import { PublicKey } from '@solana/web3.js';
import { zip } from 'ramda';
import { useTokensContext } from "../provider";

const normalizeMint = (mint: PublicKey | null | undefined): PublicKey | null | undefined => {
  if (!mint) {
    return mint;
  }

  // default pubkey is null
  if (mint.equals(PublicKey.default)) {
    return null;
  }
  return mint;
};

/**
 * Uses and loads a series of mints as {@link Token}s.
 * @param mints
 * @returns
 */
export const useTokens = (
  mints?: (PublicKey | null | undefined)[],
): (Token | null | undefined)[] => {
  const { network } = useSolana();
  const { tokenMap } = useTokensContext();

  const { normalizedMints, mintsToLoad } = useMemo(() => {
    const normalizedMints = mints?.map(normalizeMint) ?? [];
    const mintsToLoad = normalizedMints.map((mint) => {
      if (mint && tokenMap[mint.toString()]) {
        return null;
      }
      return mint;
    });

    return { normalizedMints, mintsToLoad };
  }, [mints, tokenMap]);

  // load all mints that are not in the token list
  const mintAccounts = useParsedAccountsData(mintsToLoad, MINT_PARSER);

  return useMemo(() => {
    const tokensFromMap = normalizedMints.map((mintKey) => {
      if (!mintKey) {
        return mintKey;
      }

      return tokenMap[mintKey.toString()];
    });

    return zip(tokensFromMap, mintAccounts).map(([tokenFromMap, mintAccount]) => {
      if (tokenFromMap) {
        return tokenFromMap;
      }

      if (!mintAccount) {
        return mintAccount;
      }

      const decimals = mintAccount.accountInfo.data.decimals;

      return Token.fromMint(mintAccount.accountId, decimals, {
        chainId: networkToChainId(network),
      });
    });
  }, [normalizedMints, mintAccounts, tokenMap, network]);
};
