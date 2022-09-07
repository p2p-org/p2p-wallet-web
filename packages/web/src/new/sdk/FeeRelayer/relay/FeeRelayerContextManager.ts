import { AccountLayout } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import type { FeeRelayerAPIClientType, FeeRelayerRelaySolanaClient } from 'new/sdk/FeeRelayer';
import { FeeRelayerContext, FeeRelayerError, RelayProgram } from 'new/sdk/FeeRelayer';

interface FeeRelayerContextManagerType {
  getCurrentContext(): Promise<FeeRelayerContext>;
  update(): Promise<void>;
  validate(): Promise<boolean>;
}

export class FeeRelayerContextManager implements FeeRelayerContextManagerType {
  private _owner: PublicKey;
  private _solanaAPIClient: FeeRelayerRelaySolanaClient;
  private _feeRelayerAPIClient: FeeRelayerAPIClientType;

  private _context: FeeRelayerContext | null = null;

  constructor({
    owner,
    solanaAPIClient,
    feeRelayerAPIClient,
  }: {
    owner: PublicKey;
    solanaAPIClient: FeeRelayerRelaySolanaClient;
    feeRelayerAPIClient: FeeRelayerAPIClientType;
  }) {
    this._owner = owner;
    this._solanaAPIClient = solanaAPIClient;
    this._feeRelayerAPIClient = feeRelayerAPIClient;
  }

  async getCurrentContext(): Promise<FeeRelayerContext> {
    if (!this._context) {
      await this.update();
    }
    if (!this._context) {
      throw FeeRelayerContextManagerError.invalidContext();
    }
    return this._context;
  }

  async update(): Promise<void> {
    this._context = await this._loadNewContext();
  }

  async validate(): Promise<boolean> {
    const newContext = await this._loadNewContext();
    return Boolean(this._context?.equals(newContext));
  }

  private async _loadNewContext(): Promise<FeeRelayerContext> {
    const account = this._owner;
    if (!account) {
      throw FeeRelayerError.unauthorized();
    }

    const [
      minimumTokenAccountBalance,
      minimumRelayAccountBalance,
      lamportsPerSignature,
      feePayerAddress,
      relayAccountStatus,
      usageStatus,
    ] = await Promise.all([
      this._solanaAPIClient.getMinimumBalanceForRentExemption(AccountLayout.span), // 165
      this._solanaAPIClient.getMinimumBalanceForRentExemption(0),
      this._solanaAPIClient.getLamportsPerSignature(),
      this._feeRelayerAPIClient.getFeePayerPubkey(),
      this._solanaAPIClient.getRelayAccountStatus(
        RelayProgram.getUserRelayAddress({
          user: account,
          network: this._solanaAPIClient.endpoint.network,
        }).toString(),
      ),
      (await this._feeRelayerAPIClient.requestFreeFeeLimits(account.toString())).asUsageStatus(),
    ]);

    return new FeeRelayerContext({
      minimumTokenAccountBalance,
      minimumRelayAccountBalance,
      feePayerAddress: new PublicKey(feePayerAddress),
      lamportsPerSignature,
      relayAccountStatus,
      usageStatus,
    });
  }
}

export class FeeRelayerContextManagerError extends Error {
  static invalidContext(): FeeRelayerContextManagerError {
    return new FeeRelayerContextManagerError('invalidContext');
  }
}
