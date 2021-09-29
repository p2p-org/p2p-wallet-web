import { useCallback, useEffect, useState } from 'react';

import { PublicKey } from '@solana/web3.js';
import assert from 'assert';
import { createContainer } from 'unstated-next';

import { SRM_MINT, USDC_MINT } from '../common/constants';
import { FEE_MULTIPLIER } from '../dex';
import { _useSwapFair } from './hooks/useSwapFair';

const DEFAULT_SLIPPAGE_PERCENT = 0.5;

export interface UseSwap {
  // Mint being traded from. The user must own these tokens.
  fromMint: PublicKey;
  setFromMint: (m: PublicKey) => void;

  // Mint being traded to. The user will receive these tokens after the swap.
  toMint: PublicKey;
  setToMint: (m: PublicKey) => void;

  // Amount used for the swap.
  fromAmount: number;
  setFromAmount: (a: number) => void;

  // *Expected* amount received from the swap.
  toAmount: number;
  setToAmount: (a: number) => void;

  // Function to flip what we consider to be the "to" and "from" mints.
  swapToFromMints: () => void;

  // The amount (in units of percent) a swap can be off from the estimate
  // shown to the user.
  slippage: number;
  setSlippage: (n: number) => void;

  // Null if the user is using fairs directly from DEX prices.
  // Otherwise, a user specified override for the price to use when calculating
  // swap amounts.
  fairOverride: number | null;
  setFairOverride: (n: number | null) => void;

  // The referral *owner* address. Associated token accounts must be created,
  // first, for this to be used.
  referral?: PublicKey;

  // True if all newly created market accounts should be closed in the
  // same user flow (ideally in the same transaction).
  isClosingNewAccounts: boolean;

  // True if the swap exchange rate should be a function of nothing but the
  // from and to tokens, ignoring any quote tokens that may have been
  // accumulated by performing the swap.
  //
  // Always false (for now).
  isStrict: boolean;
  setIsStrict: (isStrict: boolean) => void;

  setIsClosingNewAccounts: (b: boolean) => void;
}

export type UseSwapArgs = {
  fromMint?: PublicKey;
  toMint?: PublicKey;
  fromAmount?: number;
  toAmount?: number;
  referral?: PublicKey;
};

const useSwapInternal = (props: UseSwapArgs = {}): UseSwap => {
  const [fromMint, setFromMint] = useState(props.fromMint ?? SRM_MINT);
  const [toMint, setToMint] = useState(props.toMint ?? USDC_MINT);
  const [fromAmount, _setFromAmount] = useState(props.fromAmount ?? 0);
  const [toAmount, _setToAmount] = useState(props.toAmount ?? 0);
  const [isClosingNewAccounts, setIsClosingNewAccounts] = useState(false);
  const [isStrict, setIsStrict] = useState(false);
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE_PERCENT);
  const [fairOverride, setFairOverride] = useState<number | null>(null);
  const fair = _useSwapFair(fromMint, toMint, fairOverride);
  const referral = props.referral;

  assert.ok(slippage >= 0);

  const setFromAmount = useCallback(
    (amount: number) => {
      if (fair === undefined) {
        _setFromAmount(0);
        _setToAmount(0);
        return;
      }

      _setFromAmount(amount);
      _setToAmount(FEE_MULTIPLIER * (amount / fair));
    },
    [fair],
  );

  useEffect(() => {
    if (!fair) {
      return;
    }

    setFromAmount(fromAmount);
  }, [fair, fromAmount, setFromAmount]);

  const swapToFromMints = useCallback(() => {
    const oldFrom = fromMint;
    const oldTo = toMint;
    const oldToAmount = toAmount;

    _setFromAmount(oldToAmount);
    setFromMint(oldTo);
    setToMint(oldFrom);
  }, [fromMint, toAmount, toMint]);

  const setToAmount = useCallback(
    (amount: number) => {
      if (fair === undefined) {
        _setFromAmount(0);
        _setToAmount(0);
        return;
      }

      _setToAmount(amount);
      _setFromAmount((amount * fair) / FEE_MULTIPLIER);
    },
    [fair],
  );

  return {
    fromMint,
    setFromMint,
    toMint,
    setToMint,
    fromAmount,
    setFromAmount,
    toAmount,
    setToAmount,
    swapToFromMints,
    slippage,
    setSlippage,
    fairOverride,
    setFairOverride,
    isClosingNewAccounts,
    isStrict,
    setIsStrict,
    setIsClosingNewAccounts,
    referral,
  };
};

export const { Provider: SwapProvider, useContainer: useSwap } = createContainer(useSwapInternal);
