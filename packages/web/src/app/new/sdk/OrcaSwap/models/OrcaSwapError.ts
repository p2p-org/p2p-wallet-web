export class OrcaSwapError extends Error {
  static notFound() {
    return new OrcaSwapError('Not found');
  }

  static swapInfoMissing() {
    return new OrcaSwapError('Swap is not available');
  }

  static accountBalanceNotFound() {
    return new OrcaSwapError('Account balance is not found');
  }

  static unauthorized() {
    return new OrcaSwapError('Unauthorized');
  }

  static couldNotEstimatedMinimumOutAmount() {
    return new OrcaSwapError('Could not estimate minimum output amount');
  }

  // Pools

  static invalidPool() {
    return new OrcaSwapError('Invalid pool');
  }

  static ampDoesNotExistInPoolConfig() {
    return new OrcaSwapError('amp does not exist in poolConfig');
  }

  static estimatedAmountIsTooHigh() {
    return new OrcaSwapError('Estimated amount is too high');
  }

  static invalidNumberOfTransactions() {
    return new OrcaSwapError('Number of transactions is invalid');
  }

  // Unknown

  static unknown() {
    return new OrcaSwapError('Unknown error');
  }

  static intermediaryTokenAddressNotFound() {
    return new OrcaSwapError('Intermediary token address not found');
  }
}
