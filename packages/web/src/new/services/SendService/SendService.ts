import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';
import { Account, PublicKey } from '@solana/web3.js';
import { injectable } from 'tsyringe';

import type { FeeRelayerAPIClientType } from 'new/sdk/FeeRelayer';
import { FeeRelayerAPIClient } from 'new/sdk/FeeRelayer';
import * as FeeRelayer from 'new/sdk/FeeRelayer';
import { FeeRelayerError } from 'new/sdk/FeeRelayer/models/FeeRelayerError';
import { FeeRelayerRelay, FeeRelayerRelaySolanaClient } from 'new/sdk/FeeRelayer/relay';
import type * as OrcaSwap from 'new/sdk/OrcaSwap';
import type { Wallet } from 'new/sdk/SolanaSDK';
import * as SolanaSDK from 'new/sdk/SolanaSDK';
import {
  LogEvent,
  Logger,
  SolanaSDKError,
  SolanaSDKPublicKey,
  TokenAmount,
  toLamport,
} from 'new/sdk/SolanaSDK';
import { OrcaSwapService } from 'new/services/OrcaSwapService';
import { WalletsRepository } from 'new/services/Repositories';
import { SolanaService } from 'new/services/SolanaService';

import { FeeService } from '../FeeService';

export enum RelayMethod {
  relay,
  // reward,
}

export enum Network {
  solana,
  bitcoin,
}

export type SendServiceType = {
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
    payingFeeWallet?: Wallet;
  }): Promise<string>;
};

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
    this.relayMethod = RelayMethod.relay;

    this._feeRelayerAPIClient = new FeeRelayerAPIClient();
    this._relayService = new FeeRelayerRelay({
      owner: new Account(),
      apiClient: this._feeRelayerAPIClient,
      solanaClient: this._feeRelayerRelaySolanaClient,
      orcaSwapClient: this._orcaSwap,
    });
    // this._renVMBurnAndReleaseService = renVMBurnAndReleaseService;
  }

  // Methods

  async load(): Promise<void> {
    await this._feeService.load();

    if (this.relayMethod === RelayMethod.relay) {
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
  }): Promise<SolanaSDK.FeeAmount | null> {
    switch (network) {
      case Network.bitcoin: {
        return Promise.resolve(
          new SolanaSDK.FeeAmount({
            transaction: new u64(20000),
            accountBalances: ZERO,
            others: [
              new SolanaSDK.OtherFee({
                amount: 0.0002,
                unit: 'renBTC',
              }),
            ],
          }),
        );
      }
      case Network.solana: {
        if (!receiver) {
          return Promise.resolve(null);
        }

        switch (this.relayMethod) {
          case RelayMethod.relay: {
            // get fee calculator
            const lamportsPerSignature = this._relayService.cache.lamportsPerSignature;
            const minRentExemption = this._relayService.cache.minimumTokenAccountBalance;
            if (!lamportsPerSignature || !minRentExemption) {
              throw FeeRelayerError.unknown();
            }

            let transactionFee: u64 = ZERO;

            // owner's signature
            transactionFee = transactionFee.add(lamportsPerSignature);

            // feePayer's signature
            transactionFee = transactionFee.add(lamportsPerSignature);

            let isUnregisteredAsocciatedTokenRequest: Promise<boolean>;
            if (wallet.mintAddress === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
              isUnregisteredAsocciatedTokenRequest = Promise.resolve(false);
            } else {
              isUnregisteredAsocciatedTokenRequest = this._solanaSDK
                .findSPLTokenDestinationAddress({
                  mintAddress: wallet.mintAddress,
                  destinationAddress: receiver,
                })
                .then((addess) => addess.isUnregisteredAsocciatedToken);
            }

            // when free transaction is not available and user is paying with sol, let him do this the normal way (don't use fee relayer)
            if (
              this._isFreeTransactionNotAvailableAndUserIsPayingWithSOL({
                payingTokenMint,
              })
            ) {
              // subtract the fee payer signature cost
              transactionFee = transactionFee.sub(lamportsPerSignature);
            }

            return isUnregisteredAsocciatedTokenRequest
              .then(
                (isUnregisteredAsocciatedToken) =>
                  new SolanaSDK.FeeAmount({
                    transaction: transactionFee,
                    accountBalances: isUnregisteredAsocciatedToken ? minRentExemption : ZERO,
                  }),
              )
              .then((expectedFee) => {
                // when free transaction is not available and user is paying with sol, let him do this the normal way (don't use fee relayer)
                if (
                  this._isFreeTransactionNotAvailableAndUserIsPayingWithSOL({
                    payingTokenMint,
                  })
                ) {
                  return Promise.resolve(expectedFee);
                }

                return this._relayService.calculateNeededTopUpAmount({
                  expectedFee,
                  payingTokenMint,
                });
              });
          }
          // case RelayMethod.reward: {
          //   return Promise.resolve(SolanaSDK.FeeAmount.zero());
          // }
        }
      }
    }
  }

  getAvailableWalletsToPayFee({ feeInSOL }: { feeInSOL: SolanaSDK.FeeAmount }): Promise<Wallet[]> {
    return Promise.all(
      this._walletsRepository
        .getWallets()
        .filter((wallet) => (wallet.lamports ?? ZERO).gt(ZERO))
        .map((wallet): Promise<Wallet | null> => {
          if (wallet.mintAddress === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
            return Promise.resolve((wallet.lamports ?? ZERO).gte(feeInSOL.total) ? wallet : null);
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

  getFeesInPayingToken({
    feeInSOL,
    payingFeeWallet,
  }: {
    feeInSOL: SolanaSDK.FeeAmount;
    payingFeeWallet: Wallet;
  }): Promise<SolanaSDK.FeeAmount | null> {
    if (this.relayMethod !== RelayMethod.relay) {
      return Promise.resolve(null);
    }

    if (payingFeeWallet.mintAddress === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
      return Promise.resolve(feeInSOL);
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
    payingFeeWallet?: Wallet; // null for relayMethod === RelayMethod.reward
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
        switch (this.relayMethod) {
          case RelayMethod.relay: {
            request = this._sendToSolanaBCViaRelayMethod({
              wallet,
              receiver,
              amount: amountNew,
              payingFeeWallet,
            });
            break;
          }
          // case RelayMethod.reward: {
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

  private _sendToSolanaBCViaRelayMethod({
    wallet,
    receiver,
    amount,
    payingFeeWallet,
  }: {
    wallet: Wallet;
    receiver: string;
    amount: SolanaSDK.Lamports;
    payingFeeWallet?: Wallet;
  }): Promise<string> {
    // get paying fee token
    const payingFeeTokenNew = this._getPayingFeeToken({
      payingFeeWallet,
    });

    return this._prepareForSendingToSolanaNetworkViaRelayMethod({
      wallet,
      receiver,
      amount: new TokenAmount(wallet.token, amount).asNumber,
      payingFeeToken: payingFeeTokenNew,
    })
      .then(({ preparedTransaction, useFeeRelayer }) => {
        if (useFeeRelayer) {
          // using fee relayer
          return this._relayService
            .topUpAndRelayTransaction({
              preparedTransaction,
              payingFeeToken: payingFeeTokenNew,
              additionalPaybackFee: ZERO, // TODO: move inside relayService
            })
            .then((txIds) => txIds[0] ?? '');
        } else {
          // send normally, paid by SOL
          return this._solanaSDK.serializeAndSend({
            preparedTransaction,
            isSimulation: false,
          });
        }
      })
      .then((txId) => {
        Logger.log(txId, LogEvent.response);

        return txId;
      })
      .catch((error: Error) => {
        Logger.log(error.message, LogEvent.error);

        throw error;
      });
  }

  private _prepareForSendingToSolanaNetworkViaRelayMethod({
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
    payingFeeToken?: FeeRelayer.Relay.TokenInfo | null;
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
    let feePayerRequest: Promise<string | null>;
    let useFeeRelayer: boolean;

    // when free transaction is not available and user is paying with sol, let him do this the normal way (don't use fee relayer)
    if (
      this._isFreeTransactionNotAvailableAndUserIsPayingWithSOL({
        payingTokenMint: payingFeeToken?.mint,
      })
    ) {
      feePayerRequest = Promise.resolve(null);
      useFeeRelayer = false;
    }
    // otherwise send to fee relayer
    else {
      const pubkey = this._cachedFeePayerPubkey;
      if (usingCachedFeePayerPubkey && pubkey) {
        feePayerRequest = Promise.resolve(pubkey);
      } else {
        feePayerRequest = this._feeRelayerAPIClient.getFeePayerPubkey().then((feePayer) => {
          this._cachedFeePayerPubkey = feePayer;
          return feePayer;
        });
        useFeeRelayer = true;
      }
    }

    return feePayerRequest.then((feePayer) => {
      const feePayerNew = !feePayer ? null : new PublicKey(feePayer);

      let request: Promise<SolanaSDK.PreparedTransaction>;
      if (wallet.isNativeSOL) {
        request = this._solanaSDK.prepareSendingNativeSOL({
          destination: receiver,
          amount: amountNew,
          feePayer: feePayerNew,
          recentBlockhash,
        });
      }
      // other tokens
      else {
        request = this._solanaSDK
          .prepareSendingSPLTokens({
            mintAddress: wallet.mintAddress,
            decimals: wallet.token.decimals,
            fromPublicKey: sender,
            destinationAddress: receiver,
            amount: amountNew,
            feePayer: feePayerNew,
            transferChecked: useFeeRelayer, // create transferChecked instruction when using fee relayer
            recentBlockhash,
            minRentExemption,
          })
          .then(({ preparedTransaction }) => preparedTransaction);
      }

      return request.then((preparedTransaction) => ({
        preparedTransaction,
        useFeeRelayer,
      }));
    });
  }

  private _getPayingFeeToken({
    payingFeeWallet,
  }: {
    payingFeeWallet?: Wallet;
  }): FeeRelayer.Relay.TokenInfo | null {
    if (!payingFeeWallet) {
      return null;
    }

    const address = payingFeeWallet.pubkey;
    if (!address) {
      throw SolanaSDKError.other('Paying fee wallet is not valid');
    }

    return new FeeRelayer.Relay.TokenInfo({
      address,
      mint: payingFeeWallet.mintAddress,
    });
  }

  private _isFreeTransactionNotAvailableAndUserIsPayingWithSOL({
    payingTokenMint,
  }: {
    payingTokenMint?: string;
  }): boolean {
    const expectedTransactionFee = (
      this._relayService.cache.lamportsPerSignature ?? new u64(5000)
    ).muln(2);
    return (
      payingTokenMint === SolanaSDKPublicKey.wrappedSOLMint.toString() &&
      this._relayService.cache.freeTransactionFeeLimit?.isFreeTransactionFeeAvailable({
        transactionFee: expectedTransactionFee,
      }) === false
    );
  }
}
