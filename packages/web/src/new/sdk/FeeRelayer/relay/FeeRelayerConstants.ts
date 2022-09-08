export class FeeRelayerConstants {
  /// A default slippage value for top up operation.
  ///
  /// When user uses spl token as fee payer, fee relayer service will swap fee amount for transaction in this token to native token (SOL).
  /// In some cases if the swapping amount is to small, user can receive slippage error.
  static topUpSlippage = 0.03;
}
