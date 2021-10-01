import { PublicKey } from '@solana/web3.js';

// Returns an associated token address for spl tokens.
export async function getAssociatedTokenAddress(
  associatedProgramId: PublicKey,
  programId: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
      associatedProgramId,
    )
  )[0];
}
