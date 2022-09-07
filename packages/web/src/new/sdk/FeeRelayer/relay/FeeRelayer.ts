/* eslint-disable no-console */
import { ZERO } from '@orca-so/sdk';
import type { Network } from '@saberhq/solana-contrib';
import { Token, u64 } from '@solana/spl-token';
import type { TransactionInstruction } from '@solana/web3.js';
import { Account, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

import type {
  FeeRelayerCalculator,
  FeeRelayerContext,
  StatsInfoDeviceType,
  StatsInfoOperationType,
} from 'new/sdk/FeeRelayer';
import {
  DefaultFeeRelayerCalculator,
  FeeRelayerConstants,
  getSignature,
  TransitTokenAccountAnalysator,
} from 'new/sdk/FeeRelayer';
import type { FeeRelayerAPIClientType } from 'new/sdk/FeeRelayer/apiClient/FeeRelayerAPIClient';
import { FeeRelayerError } from 'new/sdk/FeeRelayer/models/FeeRelayerError';
import { FeeRelayerRequestType } from 'new/sdk/FeeRelayer/models/FeeRelayerRequestType';
import { RelayProgram } from 'new/sdk/FeeRelayer/relayProgram/RelayProgram';
import type * as OrcaSwap from 'new/sdk/OrcaSwap';
import type { TransactionID } from 'new/sdk/SolanaSDK';
import * as SolanaSDK from 'new/sdk/SolanaSDK';
import { getAssociatedTokenAddressSync, SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';

import type { TokenAccount } from '../models';
import type { FeeRelayerRelaySwapType, RelayAccountStatus, TopUpPreparedParams } from './helpers';
import {
  DirectSwapData,
  getSwapData,
  RelayAccountStatusType,
  RelayTransactionParam,
  SwapData,
  SwapTransactionSignatures,
  TopUpWithSwapParams,
  TransitiveSwapData,
} from './helpers';
import type { FeeRelayerRelaySolanaClient } from './helpers/FeeRelayerRelaySolanaClient';

// A fee relayer configuration.
export class FeeRelayerConfiguration {
  additionalPaybackFee: u64;

  operationType: StatsInfoOperationType;
  currency: string | null;

  constructor({
    additionalPaybackFee = ZERO,
    operationType,
    currency = null,
  }: {
    additionalPaybackFee?: u64;
    operationType: StatsInfoOperationType;
    currency?: string | null;
  }) {
    this.additionalPaybackFee = additionalPaybackFee;
    this.operationType = operationType;
    this.currency = currency;
  }
}

// The service that allows users to do gas-less transactions.
export interface FeeRelayerType {
  readonly feeCalculator: FeeRelayerCalculator;

  /// Top up relay account (if needed) and relay transaction
  topUpAndRelayTransaction({
    context,
    transaction,
    fee,
    config,
  }: {
    context: FeeRelayerContext;
    transaction: SolanaSDK.PreparedTransaction;
    fee?: TokenAccount | null;
    config: FeeRelayerConfiguration;
  }): Promise<TransactionID>;

  /// Top up relay account (if needed) and relay multiple transactions
  topUpAndRelayTransactions({
    context,
    transactions,
    fee,
    config,
  }: {
    context: FeeRelayerContext;
    transactions: SolanaSDK.PreparedTransaction[];
    fee?: TokenAccount;
    config: FeeRelayerConfiguration;
  }): Promise<TransactionID[]>;

  getFeePayer(): Promise<PublicKey>;
}

export class FeeRelayer implements FeeRelayerType {
  private _feeRelayerAPIClient: FeeRelayerAPIClientType;
  private _solanaApiClient: FeeRelayerRelaySolanaClient;
  private _orcaSwap: OrcaSwap.OrcaSwapType;
  private _owner: PublicKey; // accountStorage: SolanaSDKAccountStorage;
  feeCalculator: FeeRelayerCalculator;
  private _deviceType: StatsInfoDeviceType;
  private _buildNumber: string | null;

  get account(): PublicKey {
    return this._owner;
  }

  constructor({
    orcaSwap,
    owner,
    solanaApiClient,
    feeCalculator = new DefaultFeeRelayerCalculator(),
    feeRelayerAPIClient,
    deviceType,
    buildNumber,
  }: {
    orcaSwap: OrcaSwap.OrcaSwapType;
    owner: PublicKey; // accountStorage: SolanaSDKAccountStorage,
    solanaApiClient: FeeRelayerRelaySolanaClient;
    feeCalculator?: FeeRelayerCalculator;
    feeRelayerAPIClient: FeeRelayerAPIClientType;
    deviceType: StatsInfoDeviceType;
    buildNumber: string | null;
  }) {
    // const owner = accountStorage.account;
    // if (!owner) {
    //   throw FeeRelayerError.unauthorized();
    // }

    this._orcaSwap = orcaSwap;
    this._owner = owner; // this.accountStorage = accountStorage;
    this.feeCalculator = feeCalculator;
    this._solanaApiClient = solanaApiClient;
    this._feeRelayerAPIClient = feeRelayerAPIClient;
    this._deviceType = deviceType;
    this._buildNumber = buildNumber;
  }

  async getFeePayer(): Promise<PublicKey> {
    return new PublicKey(await this._feeRelayerAPIClient.getFeePayerPubkey());
  }

  /// Generic function for sending transaction to fee relayer's relay
  async topUpAndRelayTransaction({
    context,
    transaction,
    fee,
    config,
  }: {
    context: FeeRelayerContext;
    transaction: SolanaSDK.PreparedTransaction;
    fee?: TokenAccount | null;
    config: FeeRelayerConfiguration;
  }): Promise<TransactionID> {
    const result = (
      await this.topUpAndRelayTransactions({
        context,
        transactions: [transaction],
        fee,
        config,
      })
    )[0];
    if (!result) {
      throw FeeRelayerError.unknown();
    }
    return result;
  }

  async topUpAndRelayTransactions({
    context,
    transactions,
    fee,
    config,
  }: {
    context: FeeRelayerContext;
    transactions: SolanaSDK.PreparedTransaction[];
    fee?: TokenAccount | null;
    config: FeeRelayerConfiguration;
  }): Promise<TransactionID[]> {
    const expectedFees = transactions.map((tx) => tx.expectedFee);
    const res = await this._checkAndTopUp({
      context,
      expectedFee: new SolanaSDK.FeeAmount({
        transaction: expectedFees
          .map((fee) => fee.transaction)
          .reduce((acc, val) => acc.add(val), ZERO),
        accountBalances: expectedFees
          .map((fee) => fee.accountBalances)
          .reduce((acc, val) => acc.add(val), ZERO),
      }),
      payingFeeToken: fee,
    });

    try {
      const trx: TransactionID[] = [];
      for (const preparedTransaction of transactions) {
        const request = await this.relayTransaction({
          context,
          preparedTransaction,
          payingFeeToken: fee,
          relayAccountStatus: context.relayAccountStatus,
          additionalPaybackFee: transactions.length > 0 ? config.additionalPaybackFee : ZERO,
          operationType: config.operationType,
          currency: config.currency,
        });

        trx.push(...request);
      }

      return trx;
    } catch (error) {
      if (res) {
        throw FeeRelayerError.topUpSuccessButTransactionThrows();
      }
      throw error;
    }
  }

  private async _checkAndTopUp({
    context,
    expectedFee,
    payingFeeToken,
  }: {
    context: FeeRelayerContext;
    expectedFee: SolanaSDK.FeeAmount;
    payingFeeToken?: TokenAccount | null;
  }): Promise<string[] | null> {
    // if paying fee token is solana, skip the top up
    if (payingFeeToken?.mint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
      return Promise.resolve(null);
    }

    const topUpAmount = this.feeCalculator.calculateNeededTopUpAmount({
      context,
      expectedFee,
      payingTokenMint: payingFeeToken?.mint,
    });

    let params: TopUpPreparedParams | null;
    let needsCreateUserRelayAddress: boolean;
    if (topUpAmount.total.lten(0)) {
      // no need to top up
      [params, needsCreateUserRelayAddress] = [
        null,
        context.relayAccountStatus.type === RelayAccountStatusType.notYetCreated,
      ];
    } else {
      // top up
      if (!payingFeeToken) {
        throw FeeRelayerError.unknown();
      }

      const prepareResult = await this._prepareForTopUp1({
        context,
        topUpAmount: topUpAmount.total,
        payingFeeToken,
      });

      [params, needsCreateUserRelayAddress] = [
        prepareResult,
        context.relayAccountStatus.type === RelayAccountStatusType.notYetCreated,
      ];
    }

    const topUpParams = params;
    if (topUpParams && payingFeeToken) {
      return this.topUp({
        context,
        needsCreateUserRelayAddress,
        sourceToken: payingFeeToken,
        targetAmount: topUpParams.amount,
        topUpPools: topUpParams.poolsPair,
        expectedFee: topUpParams.expectedFee,
      });
    }

    return null;
  }
  private async _prepareForTopUp1({
    context,
    topUpAmount,
    payingFeeToken,
    forceUsingTransitiveSwap = false, // true for testing purpose only
  }: {
    context: FeeRelayerContext;
    topUpAmount: SolanaSDK.Lamports;
    payingFeeToken: TokenAccount;
    forceUsingTransitiveSwap?: boolean;
  }): Promise<TopUpPreparedParams | null> {
    // form request
    const tradableTopUpPoolsPair = await this._orcaSwap.getTradablePoolsPairs({
      fromMint: payingFeeToken.mint.toString(),
      toMint: SolanaSDKPublicKey.wrappedSOLMint.toString(),
    });
    // Get fee
    const expectedFee = this.feeCalculator.calculateExpectedFeeForTopUp(context);
    // Get pools for topping up
    let topUpPools: OrcaSwap.PoolsPair;
    // force using transitive swap (for testing only)
    if (forceUsingTransitiveSwap) {
      const pools = tradableTopUpPoolsPair.find((pair) => pair.length === 2)!;
      topUpPools = pools;
    } else {
      // prefer direct swap to transitive swap
      const directSwapPools = tradableTopUpPoolsPair.find((pair) => pair.length === 1);
      if (directSwapPools) {
        topUpPools = directSwapPools;
      } else {
        // if direct swap is not available, use transitive swap
        const transitiveSwapPools = this._orcaSwap.findBestPoolsPairForEstimatedAmount({
          estimatedAmount: topUpAmount,
          poolsPairs: tradableTopUpPoolsPair,
        });
        if (transitiveSwapPools) {
          topUpPools = transitiveSwapPools;
        }
        // no swap is available
        else {
          throw FeeRelayerError.swapPoolsNotFound();
        }
      }
    }

    // return needed amount and pools
    return {
      amount: topUpAmount,
      expectedFee,
      poolsPair: topUpPools,
    };
  }

  async topUp({
    context,
    needsCreateUserRelayAddress,
    sourceToken,
    targetAmount,
    topUpPools,
    expectedFee,
  }: {
    context: FeeRelayerContext;
    needsCreateUserRelayAddress: boolean;
    sourceToken: TokenAccount;
    targetAmount: u64;
    topUpPools: OrcaSwap.PoolsPair;
    expectedFee: u64;
  }): Promise<string[]> {
    const transitToken = TransitTokenAccountAnalysator.getTransitToken({
      solanaApiClient: this._solanaApiClient,
      orcaSwap: this._orcaSwap,
      account: this.account,
      pools: topUpPools,
    });

    const needsCreateTransitTokenAccount =
      await TransitTokenAccountAnalysator.checkIfNeedsCreateTransitTokenAccount({
        solanaApiClient: this._solanaApiClient,
        transitToken,
      });

    const blockhash = await this._solanaApiClient.getRecentBlockhash();
    const minimumRelayAccountBalance = context.minimumRelayAccountBalance;
    const minimumTokenAccountBalance = context.minimumTokenAccountBalance;
    const feePayerAddress = context.feePayerAddress;

    // STEP 3: prepare for topUp
    const topUpTransaction = await this._prepareForTopUp({
      network: this._solanaApiClient.endpoint.network,
      sourceToken,
      userAuthorityAddress: this.account,
      userRelayAddress: RelayProgram.getUserRelayAddress({
        user: this.account,
        network: this._solanaApiClient.endpoint.network,
      }),
      topUpPools,
      targetAmount,
      expectedFee,
      blockhash,
      minimumRelayAccountBalance,
      minimumTokenAccountBalance,
      needsCreateUserRelayAccount: needsCreateUserRelayAddress,
      feePayerAddress,
      needsCreateTransitTokenAccount,
      transitTokenMintPubkey: transitToken?.mint,
      transitTokenAccountAddress: transitToken?.address,
    });

    // STEP 4: send transaction
    const signatures = topUpTransaction.preparedTransaction.transaction.signatures;
    if (signatures.length < 2) {
      throw FeeRelayerError.invalidSignature();
    }

    // the second signature is the owner's signature
    const ownerSignature = getSignature(signatures, 1);

    // the third signature (optional) is the transferAuthority's signature
    let transferAuthoritySignature = null;
    try {
      transferAuthoritySignature = getSignature(signatures, 2);
    } catch {
      // ignore
    }

    const topUpSignatures = new SwapTransactionSignatures({
      userAuthoritySignature: ownerSignature,
      transferAuthoritySignature,
    });
    const result = await this._feeRelayerAPIClient.sendTransaction(
      FeeRelayerRequestType.relayTopUpWithSwap(
        new TopUpWithSwapParams({
          userSourceTokenAccountPubkey: sourceToken.address,
          sourceTokenMintPubkey: sourceToken.mint,
          userAuthorityPubkey: this.account,
          topUpSwap: new SwapData(topUpTransaction.swapData),
          feeAmount: expectedFee,
          signatures: topUpSignatures,
          blockhash,
          deviceType: this._deviceType,
          buildNumber: this._buildNumber,
        }),
      ),
    );

    return [result];
  }

  /// Prepare transaction and expected fee for a given relay transaction
  private async _prepareForTopUp({
    network,
    sourceToken,
    userAuthorityAddress,
    userRelayAddress,
    topUpPools,
    targetAmount,
    expectedFee,
    blockhash,
    minimumRelayAccountBalance,
    minimumTokenAccountBalance,
    needsCreateUserRelayAccount,
    feePayerAddress,
    // lamportsPerSignature,
    // freeTransactionFeeLimit,
    needsCreateTransitTokenAccount = false,
    transitTokenMintPubkey,
    transitTokenAccountAddress,
  }: {
    network: Network;
    sourceToken: TokenAccount;
    userAuthorityAddress: PublicKey;
    userRelayAddress: PublicKey;
    topUpPools: OrcaSwap.PoolsPair;
    targetAmount: u64;
    expectedFee: u64;
    blockhash: string;
    minimumRelayAccountBalance: u64;
    minimumTokenAccountBalance: u64;
    needsCreateUserRelayAccount: boolean;
    feePayerAddress: PublicKey;
    // lamportsPerSignature: u64;
    // freeTransactionFeeLimit?: FreeTransactionFeeLimit;
    needsCreateTransitTokenAccount?: boolean | null;
    transitTokenMintPubkey?: PublicKey | null;
    transitTokenAccountAddress?: PublicKey | null;
  }): Promise<{
    swapData: FeeRelayerRelaySwapType;
    preparedTransaction: SolanaSDK.PreparedTransaction;
  }> {
    // assertion
    const userSourceTokenAccountAddress = sourceToken.address;
    const sourceTokenMintAddress = sourceToken.mint;
    let associatedTokenAddress;
    try {
      associatedTokenAddress = getAssociatedTokenAddressSync(
        sourceTokenMintAddress,
        feePayerAddress,
      );
    } catch {
      throw FeeRelayerError.unknown();
    }

    if (userSourceTokenAccountAddress.equals(associatedTokenAddress)) {
      throw FeeRelayerError.wrongAddress();
    }

    // forming transaction and count fees
    let accountCreationFee: u64 = ZERO;
    const instructions: TransactionInstruction[] = [];

    // create user relay account
    if (needsCreateUserRelayAccount) {
      instructions.push(
        SystemProgram.transfer({
          fromPubkey: feePayerAddress,
          toPubkey: userRelayAddress,
          lamports: minimumRelayAccountBalance.toNumber(),
        }),
      );
      accountCreationFee = new u64(accountCreationFee.add(minimumRelayAccountBalance));
    }

    // top up swap
    const swap = this._prepareSwapData({
      pools: topUpPools,
      inputAmount: null,
      minAmountOut: targetAmount,
      slippage: FeeRelayerConstants.topUpSlippage,
      transitTokenMintPubkey,
      needsCreateTransitTokenAccount: needsCreateTransitTokenAccount === true,
    });
    const userTransferAuthority = swap.transferAuthorityAccount?.publicKey;

    const swapNew = swap.swapData;
    switch (swapNew.constructor) {
      case DirectSwapData: {
        accountCreationFee = new u64(accountCreationFee.add(minimumTokenAccountBalance));
        // approve
        if (userTransferAuthority) {
          instructions.push(
            Token.createApproveInstruction(
              SolanaSDKPublicKey.tokenProgramId,
              userSourceTokenAccountAddress,
              userTransferAuthority,
              userAuthorityAddress,
              [],
              (swapNew as DirectSwapData).amountIn,
            ),
          );
        }

        // top up
        instructions.push(
          RelayProgram.topUpSwapInstruction({
            network,
            topUpSwap: swapNew,
            userAuthorityAddress,
            userSourceTokenAccountAddress,
            feePayerAddress,
          }),
        );

        break;
      }

      case TransitiveSwapData: {
        // approve
        if (userTransferAuthority) {
          instructions.push(
            Token.createApproveInstruction(
              SolanaSDKPublicKey.tokenProgramId,
              userSourceTokenAccountAddress,
              userTransferAuthority,
              userAuthorityAddress,
              [],
              (swapNew as TransitiveSwapData).from.amountIn,
            ),
          );
        }

        // create transit token account
        if (needsCreateTransitTokenAccount && transitTokenAccountAddress) {
          instructions.push(
            RelayProgram.createTransitTokenAccountInstruction({
              feePayer: feePayerAddress,
              userAuthority: userAuthorityAddress,
              transitTokenAccount: transitTokenAccountAddress,
              transitTokenMint: new PublicKey(
                (swapNew as TransitiveSwapData).transitTokenMintPubkey,
              ),
              network,
            }),
          );
        }

        // Destination WSOL account funding
        accountCreationFee = new u64(accountCreationFee.add(minimumTokenAccountBalance));

        // top up
        instructions.push(
          RelayProgram.topUpSwapInstruction({
            network,
            topUpSwap: swapNew,
            userAuthorityAddress,
            userSourceTokenAccountAddress,
            feePayerAddress,
          }),
        );

        break;
      }
      default:
        throw new Error('unsupported swap type');
    }

    // transfer
    instructions.push(
      RelayProgram.transferSolInstruction({
        userAuthorityAddress,
        recipient: feePayerAddress,
        lamports: expectedFee,
        network,
      }),
    );

    const transaction = new Transaction();
    transaction.instructions = instructions;
    transaction.feePayer = feePayerAddress;
    transaction.recentBlockhash = blockhash;

    // calculate fee first
    const expectedFeeNew = new SolanaSDK.FeeAmount({
      transaction: new u64(
        await transaction.getEstimatedFee(this._solanaApiClient.provider.connection),
      ),
      accountBalances: accountCreationFee,
    });

    // resign transaction
    const signers: Account[] = [];
    const tranferAuthority = swap.transferAuthorityAccount;
    if (tranferAuthority) {
      signers.push(tranferAuthority);
    }
    if (signers.length !== 0) {
      transaction.sign(...signers);
    }

    const signedTransaction = await this._solanaApiClient.provider.wallet.signTransaction(
      transaction,
    );

    return {
      swapData: swap.swapData,
      preparedTransaction: new SolanaSDK.PreparedTransaction({
        owner: this.account,
        transaction: signedTransaction,
        signers,
        expectedFee: expectedFeeNew,
      }),
    };
  }

  /// Prepare swap data from swap pools
  private _prepareSwapData({
    pools,
    inputAmount,
    minAmountOut,
    slippage,
    transitTokenMintPubkey = null,
    newTransferAuthority = false,
    needsCreateTransitTokenAccount,
  }: {
    pools: OrcaSwap.PoolsPair;
    inputAmount?: u64 | null;
    minAmountOut?: u64 | null;
    slippage: number;
    transitTokenMintPubkey?: PublicKey | null;
    newTransferAuthority?: boolean;
    needsCreateTransitTokenAccount: boolean;
  }): {
    swapData: FeeRelayerRelaySwapType;
    transferAuthorityAccount: Account | null;
  } {
    // preconditions
    if (pools.length === 0 || pools.length > 2) {
      throw FeeRelayerError.swapPoolsNotFound();
    }
    if (!inputAmount && !minAmountOut) {
      throw FeeRelayerError.invalidAmount();
    }

    // create transferAuthority
    const transferAuthority = new Account();

    // form topUp params
    if (pools.length === 1) {
      const pool = pools[0]!;

      const amountIn = inputAmount ?? pool.getInputAmountSlippage(minAmountOut!, slippage);
      const minAmountOutNew = minAmountOut ?? pool.getInputAmountSlippage(inputAmount!, slippage);
      if (!amountIn || !minAmountOutNew) {
        throw FeeRelayerError.invalidAmount();
      }

      const directSwapData = getSwapData({
        pool,
        transferAuthorityPubkey: newTransferAuthority ? transferAuthority.publicKey : this.account,
        amountIn,
        minAmountOut: minAmountOutNew,
      });
      return {
        swapData: directSwapData,
        transferAuthorityAccount: newTransferAuthority ? transferAuthority : null,
      };
    } else {
      const firstPool = pools[0]!;
      const secondPool = pools[1]!;

      if (!transitTokenMintPubkey) {
        throw FeeRelayerError.transitTokenMintNotFound();
      }

      // if input amount is provided
      let firstPoolAmountIn = inputAmount;
      let secondPoolAmountIn: u64 | null = null;
      let secondPoolAmountOut = minAmountOut;

      if (inputAmount) {
        secondPoolAmountIn = firstPool.getMinimumAmountOut(inputAmount, slippage) ?? ZERO;
        secondPoolAmountOut = secondPool.getMinimumAmountOut(secondPoolAmountIn, slippage);
      } else if (minAmountOut) {
        secondPoolAmountIn = secondPool.getInputAmountSlippage(minAmountOut, slippage) ?? ZERO;
        firstPoolAmountIn = firstPool.getInputAmountSlippage(secondPoolAmountIn, slippage);
      }

      if (!firstPoolAmountIn || !secondPoolAmountIn || !secondPoolAmountOut) {
        throw FeeRelayerError.invalidAmount();
      }

      const transitiveSwapData = new TransitiveSwapData({
        from: getSwapData({
          pool: firstPool,
          transferAuthorityPubkey: newTransferAuthority
            ? transferAuthority.publicKey
            : this.account,
          amountIn: firstPoolAmountIn,
          minAmountOut: secondPoolAmountIn,
        }),
        to: getSwapData({
          pool: secondPool,
          transferAuthorityPubkey: newTransferAuthority
            ? transferAuthority.publicKey
            : this.account,
          amountIn: secondPoolAmountIn,
          minAmountOut: secondPoolAmountOut,
        }),
        transitTokenMintPubkey: transitTokenMintPubkey.toString(),
        needsCreateTransitTokenAccount,
      });
      return {
        swapData: transitiveSwapData,
        transferAuthorityAccount: newTransferAuthority ? transferAuthority : null,
      };
    }
  }

  async relayTransaction({
    context,
    preparedTransaction,
    payingFeeToken,
    relayAccountStatus,
    additionalPaybackFee,
  }: {
    context: FeeRelayerContext;
    preparedTransaction: SolanaSDK.PreparedTransaction;
    payingFeeToken?: TokenAccount | null;
    relayAccountStatus: RelayAccountStatus;
    additionalPaybackFee: u64;
    operationType: StatsInfoOperationType;
    currency: string | null;
  }): Promise<TransactionID[]> {
    const feePayer = context.feePayerAddress;

    // verify fee payer // TODO: check
    if (preparedTransaction.transaction.feePayer?.equals(feePayer)) {
      throw FeeRelayerError.invalidFeePayer();
    }

    // Calculate the fee to send back to feePayer
    // Account creation fee (accountBalances) is a must-pay-back fee
    let paybackFee = new u64(
      additionalPaybackFee.add(preparedTransaction.expectedFee.accountBalances),
    );

    // The transaction fee, on the other hand, is only be paid if user used more than number of free transaction fee
    if (
      !context.usageStatus.isFreeTransactionFeeAvailable({
        transactionFee: preparedTransaction.expectedFee.transaction,
      })
    ) {
      paybackFee = new u64(paybackFee.add(preparedTransaction.expectedFee.transaction));
    }

    // transfer sol back to feerelayer's feePayer
    // TODO: check references
    const preparedTransactionNew = preparedTransaction.clone();
    if (paybackFee.gtn(0)) {
      if (
        payingFeeToken?.mint.equals(SolanaSDKPublicKey.wrappedSOLMint) &&
        (relayAccountStatus.balance ?? ZERO).lt(paybackFee)
      ) {
        preparedTransactionNew.transaction.instructions.push(
          SystemProgram.transfer({
            fromPubkey: this.account,
            toPubkey: new PublicKey(feePayer),
            lamports: paybackFee.toNumber(),
          }),
        );
      } else {
        preparedTransactionNew.transaction.instructions.push(
          RelayProgram.transferSolInstruction({
            userAuthorityAddress: this.account,
            recipient: new PublicKey(feePayer),
            lamports: paybackFee,
            network: this._solanaApiClient.endpoint.network,
          }),
        );
      }
    }

    console.log(preparedTransactionNew.transaction);

    // resign transaction
    if (preparedTransactionNew.signers.length !== 0) {
      preparedTransactionNew.transaction.sign(...preparedTransactionNew.signers);
    }
    return [
      await this._feeRelayerAPIClient.sendTransaction(
        FeeRelayerRequestType.relayTransaction(new RelayTransactionParam(preparedTransactionNew)),
      ),
    ];
  }
}
