export interface SwapRouteParams {
  symbol?: string;
}

export enum VerificationError {
  swappingIsNotAvailable,
  sourceWalletIsEmpty,
  destinationWalletIsEmpty,
  canNotSwapToItSelf,
  tradablePoolsPairsNotLoaded,
  tradingPairNotSupported,
  feesIsBeingCalculated,
  couldNotCalculatingFees,
  inputAmountIsEmpty,
  inputAmountIsNotValid,
  insufficientFunds,
  estimatedAmountIsNotValid,
  bestPoolsPairsIsEmpty,
  slippageIsNotValid,
  nativeWalletNotFound,
  payingFeeWalletNotFound,
  notEnoughSOLToCoverFees,
  notEnoughBalanceToCoverFees,
  unknown,
}

export enum ActiveInputField {
  source,
  destination,
  none,
}
