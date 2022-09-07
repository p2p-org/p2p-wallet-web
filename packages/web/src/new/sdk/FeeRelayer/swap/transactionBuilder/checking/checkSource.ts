import { Token } from '@solana/spl-token';
import { Account, SystemProgram } from '@solana/web3.js';

import type { BuildContext } from 'new/sdk/FeeRelayer';
import { AccountInfo, SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';

export function checkSource(context: BuildContext): void {
  let sourceWSOLNewAccount: Account | undefined;
  if (context.config.sourceAccount.mint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
    sourceWSOLNewAccount = new Account();
    context.env.instructions.push(
      ...[
        SystemProgram.transfer({
          fromPubkey: context.config.userAccount,
          toPubkey: context.feeRelayerContext.feePayerAddress,
          lamports: context.config.inputAmount.toNumber(),
        }),
        SystemProgram.createAccount({
          fromPubkey: context.feeRelayerContext.feePayerAddress,
          newAccountPubkey: sourceWSOLNewAccount.publicKey,
          lamports: context.feeRelayerContext.minimumTokenAccountBalance.toNumber(),
          space: AccountInfo.span,
          programId: SolanaSDKPublicKey.tokenProgramId,
        }),
        Token.createInitAccountInstruction(
          SolanaSDKPublicKey.tokenProgramId,
          SolanaSDKPublicKey.wrappedSOLMint,
          sourceWSOLNewAccount.publicKey,
          context.config.userAccount,
        ),
      ],
    );
    context.env.userSource = sourceWSOLNewAccount.publicKey;
    context.env.additionalPaybackFee = context.env.additionalPaybackFee.add(
      context.feeRelayerContext.minimumTokenAccountBalance,
    );
  }

  context.env.sourceWSOLNewAccount = sourceWSOLNewAccount;
}
