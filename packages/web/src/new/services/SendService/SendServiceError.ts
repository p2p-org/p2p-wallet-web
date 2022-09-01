export class SendServiceError extends Error {
  static invalidSourceWallet() {
    return new SendServiceError('Source wallet is not valid');
  }
  static sendToYourself() {
    return new SendServiceError('You can not send tokens to yourself');
  }
  static invalidPayingFeeWallet() {
    return new SendServiceError('Paying fee wallet is not valid');
  }
  static swapPoolsNotFound() {
    return new SendServiceError('Swap pools not found');
  }
  static unknown() {
    return new SendServiceError('Unknown error');
  }
}
