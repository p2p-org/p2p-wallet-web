import { useCallback, useEffect, useMemo, useState } from 'react';

import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';
import { createContainer } from 'unstated-next';

import { useSolana } from 'app/contexts/solana';
import { useConfig, usePools, usePrice, useUser } from 'app/contexts/swap';
import SlippageTolerance from 'app/contexts/swap/models/SlippageTolerance';
import Trade from 'app/contexts/swap/models/Trade';
import { getMaxAge } from 'app/contexts/swap/utils/AsyncCache';
import { getTradeId } from 'app/contexts/swap/utils/pools';
import { minSolBalanceForSwap } from 'app/contexts/swap/utils/tokenAccounts';
import { Keys, useLocalStorage } from 'utils/hooks/useLocalStorage';

export const defaultSelectedTokens = {
  input: 'USDC',
  output: 'SOL',
};

const DEFAULT_SLIPPAGE_TOLERANCE_STATE = { numerator: '10', denominator: '1000' };

export enum ButtonState {
  ConnectWallet,
  LoadingUserData,
  RouteDoesNotExist,
  Exchange,
  TwoTransactionsStepOne,
  TwoTransactionsConfirmStepOne,
  TwoTransactionsSendingStepOne,
  TwoTransactionsRetryStepOne,
  TwoTransactionsStepTwo,
  TwoTransactionsConfirmStepTwo,
  TwoTransactionsSendingStepTwo,
  TwoTransactionsRetryStepTwo,
  ConfirmWallet,
  SendingTransaction,
  ZeroInputValue,
  InputTokenAccountDoesNotExist,
  InsufficientBalance,
  OutputTooHigh,
  NotEnoughSOL,
  HighPriceImpact,
  Retry,
}

export const stepOneLoadingStates = [
  ButtonState.TwoTransactionsConfirmStepOne,
  ButtonState.TwoTransactionsSendingStepOne,
];

export const stepOneStates = stepOneLoadingStates.concat(
  ButtonState.TwoTransactionsStepOne,
  ButtonState.TwoTransactionsRetryStepOne,
);

export const stepTwoLoadingStates = [
  ButtonState.TwoTransactionsConfirmStepTwo,
  ButtonState.TwoTransactionsSendingStepTwo,
];

export const stepTwoStates = stepTwoLoadingStates.concat(
  ButtonState.TwoTransactionsStepTwo,
  ButtonState.TwoTransactionsRetryStepTwo,
);

export interface UseSwap {
  trade: Trade;

  // Mint being traded from. The user must own these tokens.
  // fromMint: PublicKey;
  setInputTokenName: (m: string) => void;

  // Mint being traded to. The user will receive these tokens after the swap.
  // toMint: PublicKey;
  setOutputTokenName: (m: string) => void;

  // Amount used for the swap.
  // fromAmount: number;
  setInputAmount: (a: u64) => void;

  // *Expected* amount received from the swap.
  // toAmount: number;
  setOutputAmount: (a: u64) => void;

  // Function to flip what we consider to be the "to" and "from" mints.
  switchTokens: () => void;

  slippageTolerance: SlippageTolerance;
  setSlippageTolerance: (tolerance: SlippageTolerance) => void;

  // referral?: PublicKey;
}

export type UseSwapArgs = {
  fromMint?: string;
  toMint?: string;
  // fromAmount?: number;
  // toAmount?: number;
  // referral?: PublicKey;
};

const useSwapInternal = (props: UseSwapArgs = {}): UseSwap => {
  const { wallet } = useSolana();
  const { tokenConfigs, routeConfigs } = useConfig();
  const [inputTokenName, _setInputTokenName] = useState(props.fromMint ?? 'USDC');
  const [outputTokenName, _setOutputTokenName] = useState(props.toMint ?? 'SOL');
  const [slippageToleranceState, setSlippageToleranceState] = useLocalStorage<{
    numerator: string;
    denominator: string;
  }>(Keys.SLIPPAGE_TOLERANCE, DEFAULT_SLIPPAGE_TOLERANCE_STATE);
  const [buttonState, setButtonState] = useState(ButtonState.ConnectWallet);
  const [isFairnessIndicatorCollapsed, setIsFairnessIndicatorCollapsed] = useState(true);

  const slippageTolerance = useMemo(() => {
    return new SlippageTolerance(
      new u64(slippageToleranceState.numerator),
      new u64(slippageToleranceState.denominator),
    );
  }, [slippageToleranceState.numerator, slippageToleranceState.denominator]);

  const setSlippageTolerance = useCallback((tolerance: SlippageTolerance) => {
    setSlippageToleranceState({
      numerator: tolerance.numerator.toString(),
      denominator: tolerance.denominator.toString(),
    });
  }, []);

  const [trade, setTrade] = useState<Trade>(
    () =>
      new Trade({
        inputTokenName,
        outputTokenName,
        amount: ZERO,
        isInputAmount: true,
        outputTooHigh: false,
        slippageTolerance,
        tokenConfigs,
        routes: routeConfigs[getTradeId(inputTokenName, outputTokenName)],
      }),
  );

  const tradeId = getTradeId(trade.inputTokenName, trade.outputTokenName);

  const [isRefreshRateIncreased, setIsRefreshRateIncreased] = useState(false);
  const maxAge = getMaxAge(isRefreshRateIncreased);

  const { useAsyncBatchedPools, fetchPool } = usePools();
  const poolIds = routeConfigs[tradeId]
    .flat()
    .filter((poolId, idx, list) => list.indexOf(poolId) === idx);
  const asyncPools = useAsyncBatchedPools(poolIds, maxAge);

  const { useAsyncStandardTokenAccounts, refreshStandardTokenAccounts } = useUser();
  const asyncStandardTokenAccounts = useAsyncStandardTokenAccounts(maxAge);
  const inputUserTokenAccount = asyncStandardTokenAccounts.value?.[trade.inputTokenName];
  const outputUserTokenAccount = asyncStandardTokenAccounts.value?.[trade.outputTokenName];
  const solUserTokenAccount = asyncStandardTokenAccounts.value?.['SOL'];

  const { useAsyncMergedPrices } = usePrice();
  const asyncPrices = useAsyncMergedPrices();
  const inputTokenPrice = asyncPrices.value?.[trade.inputTokenName];
  const outputTokenPrice = asyncPrices.value?.[trade.outputTokenName];

  const minSolBalanceRequired = minSolBalanceForSwap(
    tokenConfigs['SOL'].decimals,
    !!asyncStandardTokenAccounts.value &&
      trade.requiresTwoTransactions(asyncStandardTokenAccounts.value),
  );

  function resetButtonStateIfTwoTransactionStates() {
    setButtonState((buttonState) => {
      if (stepOneStates.includes(buttonState) || stepTwoStates.includes(buttonState)) {
        return ButtonState.ConnectWallet;
      }

      return buttonState;
    });
  }

  function resetStates() {
    resetButtonStateIfTwoTransactionStates();
    setIsFairnessIndicatorCollapsed(true);
  }

  const setInputTokenName = useCallback(
    (tokenName: string) => {
      const routes = routeConfigs[getTradeId(tokenName, trade.outputTokenName)];
      _setInputTokenName(tokenName);
      setTrade(trade.updateInputToken(tokenName, routes));
      resetStates();
    },
    [routeConfigs, trade],
  );

  const setOutputTokenName = useCallback(
    (tokenName: string) => {
      const routes = routeConfigs[getTradeId(trade.inputTokenName, tokenName)];
      _setOutputTokenName(tokenName);
      setTrade(trade.updateOutputToken(tokenName, routes));
      resetStates();
    },
    [routeConfigs, trade],
  );

  const setInputAmount = useCallback(
    (amount: u64) => {
      resetButtonStateIfTwoTransactionStates();
      setTrade(trade.updateInputAmount(amount));
    },
    [trade],
  );

  const setOutputAmount = useCallback((amount: u64) => {
    resetButtonStateIfTwoTransactionStates();
    setTrade(trade.updateOutputAmount(amount));
  }, []);

  const switchTokens = useCallback(() => {
    resetButtonStateIfTwoTransactionStates();
    _setInputTokenName(trade.outputTokenName);
    _setOutputTokenName(trade.inputTokenName);
    setTrade(trade.switchTokens());
  }, [trade]);

  // Update trade instance when pool data becomes available
  useEffect(() => {
    if (!trade.pools && asyncPools.value) {
      setTrade(trade.updatePools(asyncPools.value));
    }
  }, [trade, asyncPools.value]);

  // Update trade instance when pool data refreshes
  useEffect(() => {
    if (asyncPools.value) {
      setTrade((trade) => trade.updatePools(asyncPools.value));
    }
  }, [asyncPools]);

  useEffect(() => {
    setTrade((trade) => trade.updateSlippageTolerance(slippageTolerance));
  }, [slippageTolerance]);

  useEffect(() => {
    if (
      buttonState === ButtonState.ConfirmWallet ||
      buttonState === ButtonState.SendingTransaction ||
      stepTwoStates.includes(buttonState) ||
      stepOneLoadingStates.includes(buttonState)
    ) {
      return;
    }

    if (!trade.routes.length) {
      setButtonState(ButtonState.RouteDoesNotExist);
    } else if (!wallet) {
      setButtonState(ButtonState.ConnectWallet);
    } else if (!asyncStandardTokenAccounts.value || !asyncPools.value) {
      setButtonState(ButtonState.LoadingUserData);
    } else {
      const inputAmount = trade.getInputAmount();

      let solRemainingForFees = solUserTokenAccount?.getAmount() || ZERO;
      if (inputTokenName === 'SOL') {
        solRemainingForFees = solRemainingForFees.lt(inputAmount)
          ? ZERO
          : solRemainingForFees.sub(inputAmount);
      }

      if (inputAmount.eq(ZERO)) {
        setButtonState(ButtonState.ZeroInputValue);
      } else if (solRemainingForFees.lt(minSolBalanceRequired)) {
        setButtonState(ButtonState.NotEnoughSOL);
      } else if (!inputUserTokenAccount || inputUserTokenAccount.getAmount().lt(inputAmount)) {
        setButtonState(ButtonState.InsufficientBalance);
      } else {
        // If the button is currently in a step one state but can now
        // exchange in one transaction, move forward to Step Two
        if (
          buttonState === ButtonState.TwoTransactionsStepOne &&
          !trade.requiresTwoTransactions(asyncStandardTokenAccounts.value)
        ) {
          setButtonState(ButtonState.TwoTransactionsStepTwo);
        }
        // If the exchange needs to be broken up into two, set to Step One
        else if (trade.requiresTwoTransactions(asyncStandardTokenAccounts.value)) {
          setButtonState(ButtonState.TwoTransactionsStepOne);
        } else if (trade.isPriceImpactHigh()) {
          setButtonState(ButtonState.HighPriceImpact);
        } else {
          setButtonState(ButtonState.Exchange);
        }
      }
    }
  }, [
    wallet,
    inputTokenName,
    tokenConfigs,
    asyncPools,
    buttonState,
    asyncStandardTokenAccounts,
    inputUserTokenAccount,
    trade,
    outputUserTokenAccount,
    solUserTokenAccount,
    minSolBalanceRequired,
  ]);

  useEffect(() => {
    setIsRefreshRateIncreased(
      buttonState === ButtonState.Exchange ||
        buttonState === ButtonState.HighPriceImpact ||
        buttonState === ButtonState.TwoTransactionsConfirmStepTwo,
    );
  }, [buttonState]);

  return {
    trade,
    // fromMint,
    setInputTokenName,
    // toMint,
    setOutputTokenName,
    // fromAmount,
    setInputAmount,
    // toAmount,
    setOutputAmount,
    switchTokens,
    slippageTolerance,
    setSlippageTolerance,
    // referral,
  };
};

export const { Provider: SwapProvider, useContainer: useSwap } = createContainer(useSwapInternal);
