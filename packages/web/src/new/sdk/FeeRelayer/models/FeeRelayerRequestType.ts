import type * as Compensation from '../compensation';
import type * as Relay from '../relay';

export class FeeRelayerRequestType {
  // Properties

  path: string;
  private _params: unknown;

  constructor({ path, params }: { path: string; params: unknown }) {
    this.path = path;
    this._params = params;
  }

  getParams() {
    return this._params;
  }

  // Builders

  static rewardTransferSOL(params: Relay.TransferSolParams): FeeRelayerRequestType {
    return new FeeRelayerRequestType({
      path: '/transfer_sol',
      params,
    });
  }

  static rewardTransferSPLToken(params: Relay.TransferSPLTokenParams): FeeRelayerRequestType {
    return new FeeRelayerRequestType({
      path: '/transfer_spl_token',
      params,
    });
  }

  static compensationSwapToken(params: Compensation.SwapTokensParams): FeeRelayerRequestType {
    return new FeeRelayerRequestType({
      path: '/swap_spl_token_with_fee_compensation',
      params,
    });
  }

  static relayTopUpWithSwap(params: Relay.TopUpWithSwapParams): FeeRelayerRequestType {
    return new FeeRelayerRequestType({
      path: '/relay_top_up_with_swap',
      params,
    });
  }

  static relaySwap(params: Relay.SwapParams): FeeRelayerRequestType {
    return new FeeRelayerRequestType({
      path: '/relay_swap',
      params,
    });
  }

  static relayTransferSPLTokena(params: Relay.TransferParam): FeeRelayerRequestType {
    return new FeeRelayerRequestType({
      path: '/relay_transfer_spl_token',
      params,
    });
  }

  static relayTransaction(params: Relay.RelayTransactionParam): FeeRelayerRequestType {
    return new FeeRelayerRequestType({
      path: '/relay_transaction',
      params,
    });
  }
}
