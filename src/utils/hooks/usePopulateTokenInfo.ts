import { useSelector } from 'react-redux';

import * as web3 from '@solana/web3.js';

import { TOKENS_BY_ENTRYPOINT } from 'constants/tokens';
import { RootState } from 'store/types';

export function usePopulateTokenInfo({
  mint,
  symbol,
}: {
  mint?: string;
  symbol?: string;
}): {
  name?: string;
  mint?: string;
  symbol?: string;
  icon?: string;
} {
  const entrypoint = useSelector((state: RootState) => state.data.blockchain.entrypoint);

  if (mint && mint.length === 44) {
    const match = TOKENS_BY_ENTRYPOINT[entrypoint]?.find((token) => token.mintAddress === mint);

    if (match) {
      return {
        name: match.tokenName,
        mint: match.mintAddress,
        symbol: match.tokenSymbol,
        icon: match.icon,
      };
    }

    return { name: undefined, mint, symbol: undefined, icon: undefined };
  }

  if (symbol && symbol.length !== 44) {
    const match = TOKENS_BY_ENTRYPOINT[entrypoint]?.find(
      (token) => token.tokenSymbol.toUpperCase() === symbol.toUpperCase(),
    );

    if (match) {
      return {
        name: match.tokenName,
        mint: match.mintAddress,
        symbol: match.tokenSymbol,
        icon: match.icon,
      };
    }

    return { name: undefined, mint, symbol, icon: undefined };
  }

  return { name: undefined, mint: undefined, symbol: undefined, icon: undefined };
}
