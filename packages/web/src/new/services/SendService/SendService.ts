import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { injectable } from 'tsyringe';

import type { UsageStatus } from 'new/sdk/FeeRelayer';
import { FeeRelayerAPIClient } from 'new/sdk/FeeRelayer';
import { FeeRelayerRelaySolanaClient } from 'new/sdk/FeeRelayer/relay';
import { FeeRelayerContextManager } from 'new/sdk/FeeRelayer/relay/FeeRelayerContextManager';
import type { Wallet } from 'new/sdk/SolanaSDK';
import * as SolanaSDK from 'new/sdk/SolanaSDK';
import { SolanaSDKPublicKey, toLamport } from 'new/sdk/SolanaSDK';
import { OrcaSwapService } from 'new/services/OrcaSwapService';
import { RelayService } from 'new/services/RelayService';
import { WalletsRepository } from 'new/services/Repositories';
import { SendServiceError } from 'new/services/SendService/SendServiceError';
import { SendServiceRelayMethod } from 'new/services/SendService/SendServiceRelayMethod';
import { SolanaService } from 'new/services/SolanaService';

export enum SendRelayMethodType {
  relay,
  // reward,
}

export class SendRelayMethod {
  type: SendRelayMethodType;

  static get relay(): SendRelayMethod {
    return new SendRelayMethod(SendRelayMethodType.relay);
  }

  constructor(type: SendRelayMethodType) {
    this.type = type;
  }

  static get default(): SendRelayMethod {
    return SendRelayMethod.relay;
  }
}

export enum Network {
  solana,
  bitcoin,
}

export interface SendServiceType {
  load(): Promise<void>;
  checkAccountValidation(account: string): Promise<boolean>;
  isTestNet(): boolean;

  getFees({
    wallet,
    receiver,
    network,
    payingTokenMint,
  }: {
    wallet: Wallet;
    receiver?: string;
    network: Network;
    payingTokenMint?: string;
  }): Promise<SolanaSDK.FeeAmount | null>;

  getFeesInPayingToken({
    feeInSOL,
    payingFeeWallet,
  }: {
    feeInSOL: SolanaSDK.FeeAmount;
    payingFeeWallet: Wallet;
  }): Promise<SolanaSDK.FeeAmount | null>;

  // TODO: hide direct usage of ``UsageStatus``
  getFreeTransactionFeeLimit(): Promise<UsageStatus>;

  getAvailableWalletsToPayFee({ feeInSOL }: { feeInSOL: SolanaSDK.FeeAmount }): Promise<Wallet[]>;

  send({
    wallet,
    receiver,
    amount,
    network,
    payingFeeWallet,
  }: {
    wallet: Wallet;
    receiver: string;
    amount: number;
    network: Network;
    payingFeeWallet?: Wallet | null;
  }): Promise<string>;
}

@injectable()
export class SendService implements SendServiceType {
  relayMethod: SendRelayMethod;

  // private _renVMBurnAndReleaseService: RenVMBurnAndReleaseServiceType;
  private _contextManager: FeeRelayerContextManager;

  private _sendServiceRelayMethod: SendServiceRelayMethod;

  constructor(
    private _solanaAPIClient: SolanaService,
    private _orcaSwap: OrcaSwapService,
    // renVMBurnAndReleaseService: RenVMBurnAndReleaseServiceType,
    private _feeRelayer: RelayService,
    private _feeRelayerRelaySolanaClient: FeeRelayerRelaySolanaClient,
    private _walletsRepository: WalletsRepository,
  ) {
    this.relayMethod = SendRelayMethod.default;

    const feeRelayerAPIClient = new FeeRelayerAPIClient();
    // this._renVMBurnAndReleaseService = renVMBurnAndReleaseService;
    this._contextManager = new FeeRelayerContextManager({
      owner: this._solanaAPIClient.provider.wallet.publicKey,
      solanaAPIClient: this._feeRelayerRelaySolanaClient,
      feeRelayerAPIClient,
    });

    // Subclasses
    this._sendServiceRelayMethod = new SendServiceRelayMethod({
      solanaAPIClient: this._solanaAPIClient,
      feeRelayer: this._feeRelayer,
    });
  }

  // Methods

  async load(): Promise<void> {
    await this._orcaSwap.load();
    await this._contextManager.update();
  }

  checkAccountValidation(account: string): Promise<boolean> {
    return this._solanaAPIClient.checkAccountValidation(account);
  }

  isTestNet(): boolean {
    // TODO: move to Network class isTestnet check
    return this._solanaAPIClient.endpoint.network !== 'mainnet-beta';
  }

  // Fees calculator

  async getFees({
    wallet,
    receiver,
    network,
    payingTokenMint,
  }: {
    wallet: Wallet;
    receiver?: string;
    network: Network;
    payingTokenMint?: string;
  }): Promise<SolanaSDK.FeeAmount | null> {
    switch (network) {
      case Network.bitcoin: {
        return new SolanaSDK.FeeAmount({
          transaction: new u64(20000),
          accountBalances: ZERO,
          others: [
            new SolanaSDK.OtherFee({
              amount: 0.0002,
              unit: 'renBTC',
            }),
          ],
        });
      }
      case Network.solana: {
        if (!receiver) {
          return null;
        }

        switch (this.relayMethod.type) {
          case SendRelayMethodType.relay: {
            return this._sendServiceRelayMethod.getFeeViaRelayMethod({
              context: await this._contextManager.getCurrentContext(),
              wallet,
              receiver,
              payingTokenMint,
            });
          }
        }
      }
      // case RelayMethod.reward: {
      //   return SolanaSDK.FeeAmount.zero();
      // }
    }
  }

  getAvailableWalletsToPayFee({ feeInSOL }: { feeInSOL: SolanaSDK.FeeAmount }): Promise<Wallet[]> {
    return Promise.all(
      this._walletsRepository
        .getWallets()
        .filter((wallet) => (wallet.lamports ?? ZERO).gt(ZERO))
        .map(async (wallet): Promise<Wallet | null> => {
          if (wallet.mintAddress === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
            return (wallet.lamports ?? ZERO).gte(feeInSOL.total) ? wallet : null;
          }

          return this._feeRelayer.feeCalculator
            .calculateFeeInPayingToken({
              orcaSwap: this._orcaSwap,
              feeInSOL,
              payingFeeTokenMint: new PublicKey(wallet.mintAddress),
            })
            .then((fee) => (fee.total ?? ZERO).lte(wallet.lamports ?? ZERO))
            .then((flag) => (flag ? wallet : null))
            .catch(() => null);
        })
        .filter(Boolean) as Promise<Wallet>[],
    );
  }

  async getFeesInPayingToken({
    feeInSOL,
    payingFeeWallet,
  }: {
    feeInSOL: SolanaSDK.FeeAmount;
    payingFeeWallet: Wallet;
  }): Promise<SolanaSDK.FeeAmount | null> {
    if (this.relayMethod.type !== SendRelayMethodType.relay) {
      return null;
    }

    if (payingFeeWallet.mintAddress === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
      return feeInSOL;
    }

    return this._feeRelayer.feeCalculator.calculateFeeInPayingToken({
      orcaSwap: this._orcaSwap,
      feeInSOL,
      payingFeeTokenMint: new PublicKey(payingFeeWallet.mintAddress),
    });
  }

  async getFreeTransactionFeeLimit(): Promise<UsageStatus> {
    return (await this._contextManager.getCurrentContext()).usageStatus;
  }

  // Send method

  async send({
    wallet,
    receiver,
    amount,
    network,
    payingFeeWallet,
  }: {
    wallet: Wallet;
    receiver: string;
    amount: number;
    network: Network;
    payingFeeWallet?: Wallet | null; // null for relayMethod === RelayMethod.reward
  }): Promise<string> {
    await this._contextManager.update();

    const amountNew = toLamport(amount, wallet.token.decimals);
    const sender = wallet.pubkey;
    if (!sender) {
      throw SendServiceError.invalidSourceWallet();
    }
    // form request
    if (receiver === sender) {
      throw SendServiceError.sendToYourself();
    }

    // detect network
    let request: Promise<string>;
    switch (network) {
      case Network.solana: {
        switch (this.relayMethod.type) {
          case SendRelayMethodType.relay: {
            request = this._sendServiceRelayMethod.sendToSolanaBCViaRelayMethod({
              context: await this._contextManager.getCurrentContext(),
              wallet,
              receiver,
              amount: amountNew,
              payingFeeWallet,
            });
            break;
          }
          // case RelayMethodType.reward: {
          //   request = this._sendToSolanaBCViaRewardMethod();
          // }
        }
        break;
      }
      case Network.bitcoin: {
        request = this._renVMBurnAndReleaseService.burnAndRelease({
          recipient: receiver,
          amount,
        });
        break;
      }
    }

    return request;
  }
}
