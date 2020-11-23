import { useSelector } from 'react-redux';

import * as web3 from '@solana/web3.js';

import { SYSTEM_PROGRAM_ID, TOKEN_PROGRAM_ID } from 'constants/solana/bufferLayouts';
import { TOKENS_BY_ENTRYPOINT } from 'constants/tokens';
import { ParsedAccountData, RootState } from 'store/types';

const defaults = {
  name: undefined,
  mint: undefined,
  owner: undefined,
  symbol: undefined,
  amount: undefined,
  decimals: undefined,
};

export function usePopulateTokenInfo(
  tokenAccount?: web3.AccountInfo<ParsedAccountData>,
): {
  name?: string;
  mint?: string;
  owner?: string;
  symbol?: string;
  amount?: number;
  decimals?: number;
} {
  const entrypoint = useSelector((state: RootState) => state.data.blockchain.entrypoint);
  const ownerAccount = useSelector((state: RootState) => state.data.blockchain.account);

  if (!tokenAccount) {
    return defaults;
  }

  const tokenPublicKey = new web3.PublicKey(String(tokenAccount?.owner));

  if (tokenPublicKey.equals(TOKEN_PROGRAM_ID)) {
    const { mint, owner, tokenAmount } = tokenAccount?.data.parsed.info || {};

    if (mint) {
      const match = TOKENS_BY_ENTRYPOINT[entrypoint]?.find((token) => token.mintAddress === mint);

      if (match) {
        return {
          ...defaults,
          name: match.tokenName,
          mint: match.mintAddress,
          owner,
          symbol: match.tokenSymbol,
          amount: tokenAmount.uiAmount,
          decimals: tokenAmount.decimals,
        };
      }

      return {
        ...defaults,
        mint,
        owner,
        amount: tokenAmount.uiAmount,
        decimals: tokenAmount.decimals,
      };
    }
  } else if (tokenPublicKey.equals(SYSTEM_PROGRAM_ID)) {
    return {
      ...defaults,
      name: 'SOL',
      owner: ownerAccount.publicKey.toBase58(),
      symbol: 'SOL',
      amount: tokenAccount.lamports / web3.LAMPORTS_PER_SOL,
      decimals: 9,
    };
  }

  return defaults;
}
