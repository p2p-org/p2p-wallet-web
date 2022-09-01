import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { injectable } from 'tsyringe';

import type { FeeRelayerAPIClientType } from 'new/sdk/FeeRelayer';
import * as FeeRelayer from 'new/sdk/FeeRelayer';
import {
  FeeRelayerAPIClient,
  FeeRelayerConfiguration,
  StatsInfoDeviceType,
  StatsInfoOperationType,
} from 'new/sdk/FeeRelayer';
import { FeeRelayerError } from 'new/sdk/FeeRelayer/models/FeeRelayerError';
import { FeeRelayerRelay, FeeRelayerRelaySolanaClient } from 'new/sdk/FeeRelayer/relay';
import type * as OrcaSwap from 'new/sdk/OrcaSwap';
import type { Wallet } from 'new/sdk/SolanaSDK';
import * as SolanaSDK from 'new/sdk/SolanaSDK';
import { convertToBalance, SolanaSDKError, SolanaSDKPublicKey, toLamport } from 'new/sdk/SolanaSDK';
import { OrcaSwapService } from 'new/services/OrcaSwapService';
import { WalletsRepository } from 'new/services/Repositories';
import { SendServiceError } from 'new/services/SendService/SendServiceError';
import { SolanaService } from 'new/services/SolanaService';

import { FeeService } from '../FeeService';

export enum RelayMethodType {
  relay,
  // reward,
}

export class RelayMethod {
  type: RelayMethodType;

  static get relay(): RelayMethod {
    return new RelayMethod(RelayMethodType.relay);
  }

  constructor(type: RelayMethodType) {
    this.type = type;
  }

  static get default(): RelayMethod {
    return RelayMethod.relay;
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

  getFreeTransactionFeeLimit(): Promise<FeeRelayer.Relay.FreeTransactionFeeLimit>;

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
  relayMethod: RelayMethod;

  private _feeRelayerAPIClient: FeeRelayerAPIClientType;
  private _relayService: FeeRelayer.Relay.FeeRelayerRelayType;
  // private _renVMBurnAndReleaseService: RenVMBurnAndReleaseServiceType;

  private _cachedFeePayerPubkey?: string;
  private _cachedPoolsSPLToSOL: { [mint in string]: OrcaSwap.PoolsPair[] } = {}; // [Mint: Pools]

  constructor(
    private _solanaSDK: SolanaService,
    private _orcaSwap: OrcaSwapService,
    // renVMBurnAndReleaseService: RenVMBurnAndReleaseServiceType,
    private _feeRelayerRelaySolanaClient: FeeRelayerRelaySolanaClient,
    private _feeService: FeeService,
    private _walletsRepository: WalletsRepository,
  ) {
    this.relayMethod = RelayMethod.default;

    this._feeRelayerAPIClient = new FeeRelayerAPIClient();
    this._relayService = new FeeRelayerRelay({
      owner: this._solanaSDK.provider.wallet.publicKey,
      feeRelayerAPIClient: this._feeRelayerAPIClient,
      solanaClient: this._feeRelayerRelaySolanaClient,
      orcaSwapClient: this._orcaSwap,
      deviceType: StatsInfoDeviceType.web,
      buildNumber: '1', // TODO: pass build number from environment
    });
    // this._renVMBurnAndReleaseService = renVMBurnAndReleaseService;
  }

  // Methods

  async load(): Promise<void> {
    await this._feeService.load();
    if (this.relayMethod.type === RelayMethod.relay.type) {
      await this._orcaSwap.load();
      await this._relayService.load();
      // load all pools
      await Promise.all(
        this._walletsRepository
          .getWallets()
          .filter((wallet) => (wallet.lamports ?? ZERO).gt(ZERO))
          .map((wallet) => {
            return this._orcaSwap
              .getTradablePoolsPairs({
                fromMint: wallet.mintAddress,
                toMint: SolanaSDKPublicKey.wrappedSOLMint.toString(),
              })
              .then((poolsPair) => {
                this._cachedPoolsSPLToSOL[wallet.mintAddress] = poolsPair;
              });
          }),
      );
    }
  }

  checkAccountValidation(account: string): Promise<boolean> {
    return this._solanaSDK.checkAccountValidation(account);
  }

  isTestNet(): boolean {
    // TODO: move to Network class isTestnet check
    return this._solanaSDK.endpoint.network !== 'mainnet-beta';
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
          case RelayMethodType.relay: {
            return this._getFeeViaRelayMethod({
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

          return this._relayService
            .calculateFeeInPayingToken({
              feeInSOL,
              payingFeeTokenMint: wallet.mintAddress,
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
    if (this.relayMethod.type !== RelayMethodType.relay) {
      return null;
    }

    if (payingFeeWallet.mintAddress === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
      return feeInSOL;
    }

    return this._relayService.calculateFeeInPayingToken({
      feeInSOL,
      payingFeeTokenMint: payingFeeWallet.mintAddress,
    });
  }

  getFreeTransactionFeeLimit(): Promise<FeeRelayer.Relay.FreeTransactionFeeLimit> {
    return this._relayService.getFreeTransactionFeeLimit();
  }

  // Send method

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
    payingFeeWallet?: Wallet | null; // null for relayMethod === RelayMethod.reward
  }): Promise<string> {
    const amountNew = toLamport(amount, wallet.token.decimals);
    const sender = wallet.pubkey;
    if (!sender) {
      throw SolanaSDKError.other('Source wallet is not valid');
    }
    // form request
    if (receiver === sender) {
      throw SolanaSDKError.other('You can not send tokens to yourself');
    }

    // detect network
    let request: Promise<string>;
    switch (network) {
      case Network.solana: {
        switch (this.relayMethod.type) {
          case RelayMethodType.relay: {
            request = this._sendToSolanaBCViaRelayMethod({
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
        request = this._renVMBurnAndReleaseService.burn();
        break;
      }
    }

    return request;
  }

  // Relay method

  private async _getFeeViaRelayMethod({
    wallet,
    receiver,
    payingTokenMint,
  }: {
    wallet: Wallet;
    receiver: string;
    payingTokenMint?: string;
  }): Promise<SolanaSDK.FeeAmount | null> {
    // get fee calculator
    const lamportsPerSignature = this._relayService.cache.lamportsPerSignature;
    const minRentExemption = this._relayService.cache.minimumTokenAccountBalance;
    if (!lamportsPerSignature || !minRentExemption) {
      throw FeeRelayerError.unknown();
    }

    let transactionFee: u64 = ZERO;

    // owner's signature
    transactionFee = new u64(transactionFee.add(lamportsPerSignature));

    // feePayer's signature
    transactionFee = new u64(transactionFee.add(lamportsPerSignature));

    let isAssociatedTokenUnregister: boolean;
    if (wallet.mintAddress === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
      isAssociatedTokenUnregister = false;
    } else {
      const destinationInfo = await this._solanaSDK.findSPLTokenDestinationAddress({
        mintAddress: wallet.mintAddress,
        destinationAddress: receiver,
      });
      isAssociatedTokenUnregister = destinationInfo.isUnregisteredAsocciatedToken;
    }

    // when free transaction is not available and user is paying with sol, let him do this the normal way (don't use fee relayer)
    if (
      this._isFreeTransactionNotAvailableAndUserIsPayingWithSOL({
        payingTokenMint,
      })
    ) {
      // subtract the fee payer signature cost
      transactionFee = new u64(transactionFee.sub(lamportsPerSignature));
    }

    const expectedFee = new SolanaSDK.FeeAmount({
      transaction: transactionFee,
      accountBalances: isAssociatedTokenUnregister ? minRentExemption : ZERO,
    });

    // when free transaction is not available and user is paying with sol, let him do this the normal way (don't use fee relayer)
    if (
      this._isFreeTransactionNotAvailableAndUserIsPayingWithSOL({
        payingTokenMint,
      })
    ) {
      return expectedFee;
    }

    return this._relayService.calculateNeededTopUpAmount({
      expectedFee,
      payingTokenMint: payingTokenMint ? new PublicKey(payingTokenMint) : undefined,
    });
  }

  private async _sendToSolanaBCViaRelayMethod({
    wallet,
    receiver,
    amount,
    payingFeeWallet,
  }: {
    wallet: Wallet;
    receiver: string;
    amount: SolanaSDK.Lamports;
    payingFeeWallet?: Wallet | null;
  }): Promise<string> {
    // get paying fee token
    const payingFeeTokenNew = this._getPayingFeeToken({
      payingFeeWallet,
    });

    const currency = wallet.mintAddress;

    const { preparedTransaction, useFeeRelayer } =
      await this._prepareForSendingToSolanaNetworkViaRelayMethod({
        wallet,
        receiver,
        amount: convertToBalance(amount, wallet.token.decimals),
        payingFeeToken: payingFeeTokenNew,
      });
    // preparedTransaction.transaction.recentBlockhash = await this._solanaSDK.getRecentBlockhash();

    if (useFeeRelayer) {
      // using fee relayer
      return this._relayService.topUpAndRelayTransaction({
        transaction: preparedTransaction,
        fee: payingFeeTokenNew,
        config: new FeeRelayerConfiguration({
          operationType: StatsInfoOperationType.transfer,
          currency,
        }),
      });
    } else {
      // send normally, paid by SOL
      return this._solanaSDK.sendTransaction({
        preparedTransaction,
      });
    }
  }

  private async _prepareForSendingToSolanaNetworkViaRelayMethod({
    wallet,
    receiver,
    amount,
    payingFeeToken,
    recentBlockhash,
    minRentExemption,
    usingCachedFeePayerPubkey,
  }: {
    wallet: Wallet;
    receiver: string;
    amount: number;
    payingFeeToken?: FeeRelayer.TokenAccount | null;
    recentBlockhash?: string;
    lamportsPerSignature?: SolanaSDK.Lamports;
    minRentExemption?: SolanaSDK.Lamports;
    usingCachedFeePayerPubkey?: boolean;
  }): Promise<{
    preparedTransaction: SolanaSDK.PreparedTransaction;
    useFeeRelayer: boolean;
  }> {
    const amountNew = toLamport(amount, wallet.token.decimals);
    const sender = wallet.pubkey;
    if (!sender) {
      throw SolanaSDKError.other('Source wallet is not valid');
    }
    // form request
    if (receiver === sender) {
      throw SolanaSDKError.other('You can not send tokens to yourself');
    }

    // prepare fee payer
    let feePayer: string | null;
    let useFeeRelayer: boolean;

    // when free transaction is not available and user is paying with sol, let him do this the normal way (don't use fee relayer)
    if (
      this._isFreeTransactionNotAvailableAndUserIsPayingWithSOL({
        payingTokenMint: payingFeeToken?.mint.toString(),
      })
    ) {
      feePayer = null;
      useFeeRelayer = false;
    }
    // otherwise send to fee relayer
    else {
      const pubkey = this._cachedFeePayerPubkey;
      if (usingCachedFeePayerPubkey && pubkey) {
        feePayer = pubkey;
      } else {
        feePayer = await this._feeRelayerAPIClient.getFeePayerPubkey();
        this._cachedFeePayerPubkey = feePayer;
      }
      useFeeRelayer = true;
    }

    const feePayerNew = !feePayer ? null : new PublicKey(feePayer);

    let preparedTransaction: SolanaSDK.PreparedTransaction;
    if (wallet.isNativeSOL) {
      preparedTransaction = await this._solanaSDK.prepareSendingNativeSOL({
        account: this._solanaSDK.provider.wallet.publicKey,
        destination: receiver,
        amount: amountNew,
        feePayer: feePayerNew,
      });
    }
    // other tokens
    else {
      preparedTransaction = (
        await this._solanaSDK.prepareSendingSPLTokens({
          account: this._solanaSDK.provider.wallet.publicKey,
          mintAddress: wallet.mintAddress,
          decimals: wallet.token.decimals,
          fromPublicKey: sender,
          destinationAddress: receiver,
          amount: amountNew,
          feePayer: feePayerNew,
          transferChecked: useFeeRelayer, // create transferChecked instruction when using fee relayer
          minRentExemption,
        })
      ).preparedTransaction;
    }

    // preparedTransaction.transaction.recentBlockhash = recentBlockhash;
    return {
      preparedTransaction,
      useFeeRelayer,
    };
  }

  private _getPayingFeeToken({
    payingFeeWallet,
  }: {
    payingFeeWallet?: Wallet | null;
  }): FeeRelayer.TokenAccount | null {
    if (!payingFeeWallet) {
      return null;
    }

    const addressString = payingFeeWallet.pubkey;
    if (!addressString) {
      throw SendServiceError.invalidPayingFeeWallet();
    }

    const address = new PublicKey(addressString);
    const mintAddress = new PublicKey(payingFeeWallet.mintAddress);

    return new FeeRelayer.TokenAccount({
      address,
      mint: mintAddress,
    });
  }

  private _isFreeTransactionNotAvailableAndUserIsPayingWithSOL({
    payingTokenMint,
  }: {
    payingTokenMint?: string;
  }): boolean {
    const expectedTransactionFee = new u64(
      (this._relayService.cache.lamportsPerSignature ?? new u64(5000)).muln(2),
    );
    return (
      payingTokenMint === SolanaSDKPublicKey.wrappedSOLMint.toString() &&
      this._relayService.cache.freeTransactionFeeLimit?.isFreeTransactionFeeAvailable({
        transactionFee: expectedTransactionFee,
      }) === false
    );
  }
}
