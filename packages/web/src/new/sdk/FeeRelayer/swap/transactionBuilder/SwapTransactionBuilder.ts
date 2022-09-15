import type { u64 } from '@solana/spl-token';
import type { Account, TransactionInstruction } from '@solana/web3.js';
import { Transaction } from '@solana/web3.js';

import {
  calculateTransactionFee,
  FeeAmount,
  getAssociatedTokenAddressSync,
  PreparedTransaction,
} from 'new/sdk/SolanaSDK';

import { FeeRelayerError } from '../../models';
import type { BuildContext } from './BuildContext';
import {
  buildSwapData,
  checkClosingAccount,
  checkDestination,
  checkSigners,
  checkSource,
  checkSwapData,
  checkTransitTokenAccount,
} from './checking';

export class SwapTransactionBuilder {
  static async prepareSwapTransaction(context: BuildContext): Promise<{
    transactions: PreparedTransaction[];
    additionalPaybackFee: u64;
  }> {
    context.env.userSource = context.config.sourceAccount.address;

    const associatedToken = getAssociatedTokenAddressSync(
      context.config.sourceAccount.mint,
      context.feeRelayerContext.feePayerAddress,
    );
    if (context.env.userSource.equals(associatedToken)) {
      throw FeeRelayerError.wrongAddress();
    }

    // check transit token
    await checkTransitTokenAccount(context);

    // check source
    checkSource(context);

    // check destination
    await checkDestination(context);

    // build swap data
    checkSwapData(
      context,
      buildSwapData({
        userAccount: context.config.userAccount,
        pools: context.config.pools,
        inputAmount: context.config.inputAmount,
        minAmountOut: null,
        slippage: context.config.slippage,
        transitTokenMintPubkey: context.env.transitTokenMintPubkey,
        needsCreateTransitTokenAccount: Boolean(context.env.needsCreateTransitTokenAccount),
      }),
    );

    // closing accounts
    checkClosingAccount(context);

    // check signers
    checkSigners(context);

    const transactions: PreparedTransaction[] = [];

    // include additional transaciton
    const additionalTransaction = context.env.additionalTransaction;
    if (additionalTransaction) {
      transactions.push(additionalTransaction);
    }

    // make primary transaction
    transactions.push(
      await SwapTransactionBuilder.makeTransaction({
        context: context,
        instructions: context.env.instructions,
        signers: context.env.signers,
        blockhash: context.config.blockhash,
        accountCreationFee: context.env.accountCreationFee,
      }),
    );

    return {
      transactions,
      additionalPaybackFee: context.env.additionalPaybackFee,
    };
  }

  static async makeTransaction({
    context,
    instructions,
    signers = [],
    blockhash,
    accountCreationFee,
  }: {
    context: BuildContext;
    instructions: TransactionInstruction[];
    signers?: Account[];
    blockhash: string;
    accountCreationFee: u64;
  }): Promise<PreparedTransaction> {
    const transaction = new Transaction();
    transaction.instructions = instructions;
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = context.feeRelayerContext.feePayerAddress;

    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }
    // const signedTransaction = await context.solanaApiClient.provider.wallet.signTransaction(
    //   transaction,
    // );

    // calculate fee first
    const expectedFee = new FeeAmount({
      // TODO: return when works
      // transaction: new u64(
      //   await signedTransaction.getEstimatedFee(context.solanaApiClient.provider.connection),
      // ),
      transaction: calculateTransactionFee(
        transaction,
        context.feeRelayerContext.lamportsPerSignature,
      ),
      accountBalances: accountCreationFee,
    });

    return new PreparedTransaction({
      owner: context.config.userAccount, // instead of signers with owner
      transaction: transaction,
      signers,
      expectedFee,
    });
  }
}
