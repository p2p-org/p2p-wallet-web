import { Provider } from '@project-serum/anchor';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair, PublicKey, Signer, SystemProgram, Transaction } from '@solana/web3.js';
import BN from 'bn.js';

import { SOL_MINT, WRAPPED_SOL_MINT } from 'app/contexts/swapSerum';

export async function wrapSol(
  provider: Provider,
  wrappedSolAccount: Keypair,
  fromMint: PublicKey,
  amount: BN,
): Promise<{ tx: Transaction; signers: Array<Signer> }> {
  const tx = new Transaction();
  const signers = [wrappedSolAccount];

  // Create new, rent exempt account.
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: wrappedSolAccount.publicKey,
      lamports: await Token.getMinBalanceRentForExemptAccount(provider.connection),
      space: 165,
      programId: TOKEN_PROGRAM_ID,
    }),
  );

  // Transfer lamports. These will be converted to an SPL balance by the
  // token program.
  if (fromMint.equals(SOL_MINT)) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: wrappedSolAccount.publicKey,
        lamports: amount.toNumber(),
      }),
    );
  }

  // Initialize the account.
  tx.add(
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      WRAPPED_SOL_MINT,
      wrappedSolAccount.publicKey,
      provider.wallet.publicKey,
    ),
  );

  return { tx, signers };
}
