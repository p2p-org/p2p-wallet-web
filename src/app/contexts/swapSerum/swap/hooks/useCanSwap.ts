// Returns true if the user can swap with the current context.
import { useSwap } from 'app/contexts/swapSerum/swap';

import { useDex } from '../../dex';
import { useRouteVerbose } from '../../dex/hooks';
import { useMint } from '../../token/hooks';
import { useOwnedTokenAccount } from '../../token/hooks';
import { SPL_REGISTRY_SOLLET_TAG, SPL_REGISTRY_WORM_TAG, useTokenList } from '../../tokenList';
import { useSwapFair } from './useSwapFair';

export function useCanSwap(): boolean {
  const { fromMint, toMint, fromAmount, toAmount } = useSwap();
  const { swapClient } = useDex();
  const { wormholeMap, solletMap } = useTokenList();
  const fromWallet = useOwnedTokenAccount(fromMint);
  const fair = useSwapFair();
  const route = useRouteVerbose(fromMint, toMint);

  const fromTokenAccount = useOwnedTokenAccount(fromMint);
  const fromMintAccount = useMint(fromMint);
  const fromBalance =
    fromTokenAccount &&
    fromMintAccount &&
    fromTokenAccount.account.amount.toNumber() / 10 ** fromMintAccount.decimals;
  const hasFromBalance = (fromBalance || 0) >= fromAmount;

  if (route === null) {
    return false;
  }

  return (
    // From wallet exists.
    fromWallet !== undefined &&
    fromWallet !== null &&
    // Fair price is defined.
    fair !== undefined &&
    fair > 0 &&
    // Mints are distinct.
    fromMint.equals(toMint) === false &&
    // Wallet is connected.
    swapClient.program.provider.wallet.publicKey !== null &&
    // Trade amounts greater than zero.
    fromAmount > 0 &&
    toAmount > 0 &&
    // From token account has enougth balance
    hasFromBalance &&
    // Trade route exists.
    route !== null &&
    // Wormhole <-> native markets must have the wormhole token as the
    // *from* address since they're one-sided markets.
    (route.kind !== 'wormhole-native' ||
      wormholeMap.get(fromMint.toString())?.tags?.includes(SPL_REGISTRY_WORM_TAG) !== undefined) &&
    // Wormhole <-> sollet markets must have the sollet token as the
    // *from* address since they're one sided markets.
    (route.kind !== 'wormhole-sollet' ||
      solletMap.get(fromMint.toString())?.tags?.includes(SPL_REGISTRY_SOLLET_TAG) !== undefined)
  );
}
