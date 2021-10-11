import { useCallback } from 'react';

import BN from 'bn.js';

import { useDex, useSwap } from 'app/contexts/swapSerum';
import { FEE_MULTIPLIER, useOpenOrders } from 'app/contexts/swapSerum/dex';

import { useSwapData } from './useSwapData';

export const useSendSwap = () => {
  const { swapClient } = useDex();
  const openOrders = useOpenOrders();

  const { fromMint, toMint, fromAmount, slippage, isStrict } = useSwap();
  const {
    fromMintInfo,
    toMintInfo,
    fromWallet,
    toWallet,
    fromMarket,
    toMarket,
    route,
    quoteMint,
    quoteMintInfo,
    quoteWallet,
    fair,
    referral,
  } = useSwapData({ fromMint, toMint });

  const swap = useCallback(async () => {
    if (!fromWallet) {
      throw new Error('Unable to get from wallet');
    }

    if (!fromMintInfo || !toMintInfo) {
      throw new Error('Unable to calculate mint decimals');
    }

    if (!fair) {
      throw new Error('Invalid fair');
    }

    if (!quoteMint || !quoteMintInfo) {
      throw new Error('Quote mint not found');
    }

    if (!fromMarket) {
      throw new Error('Market undefined');
    }

    const amount = new BN(fromAmount * 10 ** fromMintInfo.decimals);
    const minExchangeRate = {
      rate: new BN((10 ** toMintInfo.decimals * FEE_MULTIPLIER) / fair)
        .muln(100 - slippage)
        .divn(100),
      fromDecimals: fromMintInfo.decimals,
      quoteDecimals: quoteMintInfo.decimals,
      strict: isStrict,
    };

    const fromOpenOrders = fromMarket ? openOrders.get(fromMarket?.address.toString()) : undefined;
    const toOpenOrders = toMarket ? openOrders.get(toMarket?.address.toString()) : undefined;

    await swapClient
      .prepare({
        fromMint,
        toMint,
        quoteMint,
        amount,
        minExchangeRate,
        referral,
        fromMarket,
        toMarket,
        // Automatically created if undefined.
        fromOpenOrders: fromOpenOrders ? fromOpenOrders[0].address : undefined,
        toOpenOrders: toOpenOrders ? toOpenOrders[0].address : undefined,
        fromWallet: fromWallet.publicKey,
        toWallet: toWallet?.publicKey,
        quoteWallet: quoteWallet?.publicKey,
      })
      .swap();
  }, [
    fromMintInfo,
    toMintInfo,
    fair,
    quoteMint,
    quoteMintInfo,
    fromAmount,
    fromMint,
    toMint,
    fromMarket,
    slippage,
    isStrict,
    openOrders,
    toMarket,
    fromWallet,
    toWallet,
    swapClient,
    referral,
    quoteWallet,
  ]);

  return { swap, route };
};
