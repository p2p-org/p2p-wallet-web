import { Token, u64 } from '@solana/spl-token';
import { Account, SystemProgram } from '@solana/web3.js';

import type { BuildContext } from 'new/sdk/FeeRelayer';
import { DestinationAnalysator } from 'new/sdk/FeeRelayer';
import { SwapTransactionBuilder } from 'new/sdk/FeeRelayer/swap/transactionBuilder/SwapTransactionBuilder';
import { AccountInfo, getAssociatedTokenAddressSync, SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';

export async function checkDestination(context: BuildContext): Promise<void> {
  let destinationNewAccount: Account | undefined;

  const destinationInfo = await DestinationAnalysator.analyseDestination({
    apiClient: context.solanaApiClient,
    destination: context.config.destinationAddress,
    mint: context.config.destinationTokenMint,
    userAccount: context.config.userAccount,
  });

  let userDestinationTokenAccountAddress = destinationInfo.destination.address;

  if (destinationInfo.needCreateDestination) {
    if (destinationInfo.destination.mint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
      // For native solana, create and initialize WSOL
      destinationNewAccount = new Account();
      context.env.instructions.push(
        ...[
          SystemProgram.createAccount({
            fromPubkey: context.feeRelayerContext.feePayerAddress,
            newAccountPubkey: destinationNewAccount.publicKey,
            lamports: context.feeRelayerContext.minimumTokenAccountBalance.toNumber(),
            space: AccountInfo.span,
            programId: SolanaSDKPublicKey.tokenProgramId,
          }),
          Token.createInitAccountInstruction(
            SolanaSDKPublicKey.tokenProgramId,
            destinationInfo.destination.mint,
            destinationNewAccount.publicKey,
            context.config.userAccount,
          ),
        ],
      );
      userDestinationTokenAccountAddress = destinationNewAccount.publicKey;
      context.env.accountCreationFee = context.env.accountCreationFee.add(
        context.feeRelayerContext.minimumTokenAccountBalance,
      );
    }
  } else {
    // For other token, create associated token address
    const associatedAddress = getAssociatedTokenAddressSync(
      destinationInfo.destination.mint,
      context.config.userAccount,
    );

    const instruction = Token.createAssociatedTokenAccountInstruction(
      SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
      SolanaSDKPublicKey.tokenProgramId,
      destinationInfo.destination.mint,
      associatedAddress,
      context.config.userAccount,
      context.feeRelayerContext.feePayerAddress,
    );

    // SPECIAL CASE WHEN WE SWAP FROM SOL TO NON-CREATED SPL TOKEN, THEN WE NEEDS ADDITIONAL TRANSACTION BECAUSE TRANSACTION IS TOO LARGE
    if (context.env.sourceWSOLNewAccount) {
      context.env.additionalTransaction = await SwapTransactionBuilder.makeTransaction({
        context,
        instructions: [instruction],
        blockhash: context.config.blockhash,
        accountCreationFee: context.feeRelayerContext.minimumTokenAccountBalance,
      });
    } else {
      context.env.instructions.push(instruction);
      context.env.accountCreationFee = new u64(
        context.env.accountCreationFee.add(context.feeRelayerContext.minimumTokenAccountBalance),
      );
    }
    userDestinationTokenAccountAddress = associatedAddress;
  }

  context.env.destinationNewAccount = destinationNewAccount;
  context.env.userDestinationTokenAccountAddress = userDestinationTokenAccountAddress;
}
