import type { AugmentedProvider } from '@saberhq/solana-contrib';
import { TransactionEnvelope } from '@saberhq/solana-contrib';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';

export const closeAccount = (
  provider: AugmentedProvider,
  publicKey: PublicKey,
  wallet: PublicKey,
): TransactionEnvelope => {
  const closeAccountInstruction = Token.createCloseAccountInstruction(
    TOKEN_PROGRAM_ID,
    publicKey,
    wallet,
    wallet,
    [],
  );

  return new TransactionEnvelope(provider, [closeAccountInstruction]);
};
