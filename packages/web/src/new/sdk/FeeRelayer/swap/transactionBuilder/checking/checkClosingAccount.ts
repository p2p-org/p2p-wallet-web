import { Token, u64 } from '@solana/spl-token';
import { SystemProgram } from '@solana/web3.js';

import type { BuildContext } from 'new/sdk/FeeRelayer';
import { SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';

export function checkClosingAccount(context: BuildContext): void {
  const newAccount = context.env.sourceWSOLNewAccount;
  if (newAccount) {
    context.env.instructions.push(
      Token.createCloseAccountInstruction(
        SolanaSDKPublicKey.tokenProgramId,
        newAccount.publicKey,
        context.config.userAccount,
        context.config.userAccount,
        [],
      ),
    );
  }
  // close destination
  const newAccountNew = context.env.destinationNewAccount;
  if (
    newAccountNew &&
    context.config.destinationTokenMint.equals(SolanaSDKPublicKey.wrappedSOLMint)
  ) {
    context.env.instructions.push(
      ...[
        Token.createCloseAccountInstruction(
          SolanaSDKPublicKey.tokenProgramId,
          newAccountNew.publicKey,
          context.config.userAccount,
          context.config.userAccount,
          [],
        ),
        SystemProgram.transfer({
          fromPubkey: context.config.userAccount,
          toPubkey: context.feeRelayerContext.feePayerAddress,
          lamports: context.feeRelayerContext.minimumTokenAccountBalance.toNumber(),
        }),
      ],
    );
    context.env.accountCreationFee = new u64(
      context.env.accountCreationFee.sub(context.feeRelayerContext.minimumTokenAccountBalance),
    );
  }
}
