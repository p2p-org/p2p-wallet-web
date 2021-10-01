import { Provider } from '@project-serum/anchor';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair, Signer, Transaction } from '@solana/web3.js';

export function unwrapSol(
  provider: Provider,
  wrappedSolAccount: Keypair,
): { tx: Transaction; signers: Array<Signer> } {
  const tx = new Transaction();

  tx.add(
    Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      wrappedSolAccount.publicKey,
      provider.wallet.publicKey,
      provider.wallet.publicKey,
      [],
    ),
  );

  return { tx, signers: [] };
}
