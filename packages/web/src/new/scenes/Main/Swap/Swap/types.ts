export interface SwapRouteParams {
  symbol?: string;
}

export enum VerificationError {
  swappingIsNotAvailable = 'swappingIsNotAvailable',
  sourceWalletIsEmpty = 'sourceWalletIsEmpty',
  destinationWalletIsEmpty = 'destinationWalletIsEmpty',
  canNotSwapToItSelf = 'canNotSwapToItSelf',
  tradablePoolsPairsNotLoaded = 'tradablePoolsPairsNotLoaded',
  tradingPairNotSupported = 'tradingPairNotSupported',
  feesIsBeingCalculated = 'feesIsBeingCalculated',
  couldNotCalculatingFees = 'couldNotCalculatingFees',
  inputAmountIsEmpty = 'inputAmountIsEmpty',
  inputAmountIsNotValid = 'inputAmountIsNotValid',
  insufficientFunds = 'insufficientFunds',
  estimatedAmountIsNotValid = 'estimatedAmountIsNotValid',
  bestPoolsPairsIsEmpty = 'bestPoolsPairsIsEmpty',
  slippageIsNotValid = 'slippageIsNotValid',
  nativeWalletNotFound = 'nativeWalletNotFound',
  payingFeeWalletNotFound = 'payingFeeWalletNotFound',
  notEnoughSOLToCoverFees = 'notEnoughSOLToCoverFees',
  notEnoughBalanceToCoverFees = 'notEnoughBalanceToCoverFees',
  unknown = 'unknown',
}

export enum ActiveInputField {
  source = 'source',
  destination = 'destination',
  none = 'none',
}
