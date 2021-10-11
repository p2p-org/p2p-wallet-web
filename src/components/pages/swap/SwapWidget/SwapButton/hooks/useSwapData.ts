import { PublicKey } from '@solana/web3.js';

import { useFairRoute, useMarket, useRouteVerbose } from 'app/contexts/swapSerum/dex';
import { useReferral } from 'app/contexts/swapSerum/swap';
import { useMint, useOwnedTokenAccount } from 'app/contexts/swapSerum/token';

interface UseSwapData {
  fromMintInfo: ReturnType<typeof useMint>;
  toMintInfo: ReturnType<typeof useMint>;
  fromWallet: ReturnType<typeof useOwnedTokenAccount>;
  toWallet: ReturnType<typeof useOwnedTokenAccount>;
  route: ReturnType<typeof useRouteVerbose>;
  fromMarket: ReturnType<typeof useMarket>;
  toMarket: ReturnType<typeof useMarket>;
  quoteMint: PublicKey | undefined;
  quoteMintInfo: ReturnType<typeof useMint>;
  quoteWallet: ReturnType<typeof useOwnedTokenAccount>;
  fair: ReturnType<typeof useFairRoute>;
  referral: ReturnType<typeof useReferral>;
}

export const useSwapData = ({
  fromMint,
  toMint,
}: {
  fromMint: PublicKey;
  toMint: PublicKey;
}): UseSwapData => {
  const fromMintInfo = useMint(fromMint);
  const toMintInfo = useMint(toMint);

  const fromWallet = useOwnedTokenAccount(fromMint);
  const toWallet = useOwnedTokenAccount(toMint);

  const route = useRouteVerbose(fromMint, toMint);

  const fromMarket = useMarket(route && route.markets ? route.markets[0] : undefined);
  const toMarket = useMarket(route && route.markets ? route.markets[1] : undefined);

  const quoteMint = fromMarket && fromMarket.quoteMintAddress;
  const quoteMintInfo = useMint(quoteMint);
  const quoteWallet = useOwnedTokenAccount(quoteMint);

  const fair = useFairRoute(fromMint, toMint);

  const referral = useReferral(fromMarket);

  return {
    fromMintInfo,
    toMintInfo,
    fromWallet,
    toWallet,
    route,
    fromMarket,
    toMarket,
    quoteMint,
    quoteMintInfo,
    quoteWallet,
    fair,
    referral,
  };
};
