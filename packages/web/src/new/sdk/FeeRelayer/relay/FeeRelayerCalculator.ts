import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';

import { FeeRelayerConstants } from 'new/sdk/FeeRelayer';
import type { OrcaSwapType } from 'new/sdk/OrcaSwap';
import { getInputAmountSlippage } from 'new/sdk/OrcaSwap';
import * as SolanaSDK from 'new/sdk/SolanaSDK';
import { SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';

import { FeeRelayerError } from '../models';
import type { FeeRelayerContext } from './FeeRelayerContext';
import { RelayAccountStatusType } from './helpers';

export interface FeeRelayerCalculator {
  /// Calculate a top up amount for user's relayer account.
  ///
  /// The user's relayer account will be used as fee payer address.
  /// - Parameters:
  ///   - context: Processing context
  ///   - expectedFee: an amount of fee, that blockchain need to process if user's send directly.
  ///   - payingTokenMint: a mint address of spl token, that user will use to play fee.
  /// - Returns: Fee amount in SOL
  /// - Throws:
  calculateNeededTopUpAmount({
    context,
    expectedFee,
    payingTokenMint,
  }: {
    context: FeeRelayerContext;
    expectedFee: SolanaSDK.FeeAmount;
    payingTokenMint?: PublicKey;
  }): SolanaSDK.FeeAmount;

  calculateExpectedFeeForTopUp(context: FeeRelayerContext): u64;

  /// Convert fee amount into spl value.
  ///
  /// - Parameters:
  ///   - orcaSwap: OrcaSwap service
  ///   - feeInSOL: a fee amount in SOL
  ///   - payingFeeTokenMint: a mint address of spl token, that user will use to play fee.
  /// - Returns:
  /// - Throws:
  calculateFeeInPayingToken({
    orcaSwap,
    feeInSOL,
    payingFeeTokenMint,
  }: {
    orcaSwap: OrcaSwapType;
    feeInSOL: SolanaSDK.FeeAmount;
    payingFeeTokenMint: PublicKey;
  }): Promise<SolanaSDK.FeeAmount>;
}

export class DefaultFeeRelayerCalculator implements FeeRelayerCalculator {
  constructor() {}

  calculateNeededTopUpAmount({
    context,
    expectedFee,
    payingTokenMint,
  }: {
    context: FeeRelayerContext;
    expectedFee: SolanaSDK.FeeAmount;
    payingTokenMint?: PublicKey;
  }): SolanaSDK.FeeAmount {
    const amount = this._calculateMinTopUpAmount({
      context,
      expectedFee,
      payingTokenMint,
    });

    // Correct amount if it's too small
    if (amount.total.gtn(0) && amount.total.ltn(1000)) {
      amount.transaction = new u64(amount.transaction.add(new u64(1000).sub(amount.total)));
    }

    // TODO: amount.transaction = max(1000, amount.total)
    return amount;
  }

  /// Calculate needed top up amount for expected fee
  private _calculateMinTopUpAmount({
    context,
    expectedFee,
    payingTokenMint,
  }: {
    context: FeeRelayerContext;
    expectedFee: SolanaSDK.FeeAmount;
    payingTokenMint?: PublicKey;
  }): SolanaSDK.FeeAmount {
    const neededAmount = expectedFee.clone();

    // expected fees
    const expectedTopUpNetworkFee = new u64(context.lamportsPerSignature.muln(2));
    const expectedTransactionNetworkFee = new u64(expectedFee.transaction);

    // real fees
    let neededTopUpNetworkFee = new u64(expectedTopUpNetworkFee);
    let neededTransactionNetworkFee = new u64(expectedTransactionNetworkFee);

    // is Top up free
    if (
      context.usageStatus.isFreeTransactionFeeAvailable({
        transactionFee: expectedTopUpNetworkFee,
      })
    ) {
      neededTopUpNetworkFee = ZERO;
    }

    // is transaction free
    if (
      context.usageStatus.isFreeTransactionFeeAvailable({
        transactionFee: expectedTopUpNetworkFee.add(expectedTransactionNetworkFee),
        forNextTransaction: true,
      })
    ) {
      neededTransactionNetworkFee = ZERO;
    }

    neededAmount.transaction = new u64(neededTopUpNetworkFee.add(neededTransactionNetworkFee));

    // transaction is totally free
    if (neededAmount.total.eqn(0)) {
      return neededAmount;
    }

    const neededAmountWithoutCheckingRelayAccount = neededAmount.clone();
    const minimumRelayAccountBalance = context.minimumRelayAccountBalance;

    // check if relay account current balance can cover part of needed amount
    let relayAccountBalance = context.relayAccountStatus.balance;
    if (relayAccountBalance) {
      if (relayAccountBalance.lt(minimumRelayAccountBalance)) {
        neededAmount.transaction = new u64(
          neededAmount.transaction.add(minimumRelayAccountBalance.sub(relayAccountBalance)),
        );
      } else {
        relayAccountBalance = new u64(relayAccountBalance.sub(minimumRelayAccountBalance));

        // if relayAccountBalance has enough balance to cover transaction fee
        if (relayAccountBalance.gte(neededAmount.transaction)) {
          neededAmount.transaction = ZERO;

          // if relayAccountBalance has enough balance to cover accountBalances fee too
          if (relayAccountBalance.sub(neededAmount.transaction).gte(neededAmount.accountBalances)) {
            neededAmount.accountBalances = ZERO;
          }
          // Relay account balance can cover part of account creation fee
          else {
            neededAmount.accountBalances = new u64(
              neededAmount.accountBalances
                .sub(relayAccountBalance.sub(neededAmount.transaction))
                .toString(),
            );
          }
        }
        // if not, relayAccountBalance can cover part of transaction fee
        else {
          neededAmount.transaction = new u64(neededAmount.transaction.sub(relayAccountBalance));
        }
      }
    } else {
      neededAmount.transaction = new u64(neededAmount.transaction.add(minimumRelayAccountBalance));
    }

    // if relay account could not cover all fees and paying token is WSOL, the compensation will be done without the existense of relay account
    if (neededAmount.total.gtn(0) && payingTokenMint?.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
      return neededAmountWithoutCheckingRelayAccount;
    }

    return neededAmount;
  }

  calculateExpectedFeeForTopUp(context: FeeRelayerContext): u64 {
    let expectedFee: u64 = ZERO;
    if (context.relayAccountStatus.type === RelayAccountStatusType.notYetCreated) {
      expectedFee = expectedFee.add(context.minimumRelayAccountBalance);
    }

    const transactionNetworkFee = new u64(2).mul(context.lamportsPerSignature);
    if (
      !context.usageStatus.isFreeTransactionFeeAvailable({
        transactionFee: transactionNetworkFee,
      })
    ) {
      expectedFee = expectedFee.add(transactionNetworkFee);
    }

    expectedFee = expectedFee.add(context.minimumTokenAccountBalance);
    return new u64(expectedFee.toString());
  }

  async calculateFeeInPayingToken({
    orcaSwap,
    feeInSOL,
    payingFeeTokenMint,
  }: {
    orcaSwap: OrcaSwapType;
    feeInSOL: SolanaSDK.FeeAmount;
    payingFeeTokenMint: PublicKey;
  }): Promise<SolanaSDK.FeeAmount> {
    if (payingFeeTokenMint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
      return feeInSOL;
    }
    const tradableTopUpPoolsPair = await orcaSwap.getTradablePoolsPairs({
      fromMint: payingFeeTokenMint.toString(),
      toMint: SolanaSDKPublicKey.wrappedSOLMint.toString(),
    });
    const topUpPools = orcaSwap.findBestPoolsPairForEstimatedAmount({
      estimatedAmount: feeInSOL.total,
      poolsPairs: tradableTopUpPoolsPair,
    });
    if (!topUpPools) {
      throw FeeRelayerError.swapPoolsNotFound();
    }

    const transactionFee = getInputAmountSlippage(
      topUpPools,
      feeInSOL.transaction,
      FeeRelayerConstants.topUpSlippage,
    );
    const accountCreationFee = getInputAmountSlippage(
      topUpPools,
      feeInSOL.accountBalances,
      FeeRelayerConstants.topUpSlippage,
    );

    return new SolanaSDK.FeeAmount({
      transaction: transactionFee ?? ZERO,
      accountBalances: accountCreationFee ?? ZERO,
    });
  }
}
