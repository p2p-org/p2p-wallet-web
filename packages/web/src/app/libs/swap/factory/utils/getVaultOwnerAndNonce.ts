// Return the program derived address used by the serum DEX to control token

import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

import { DEX_PID } from '../../constants';

// vaults.
export async function getVaultOwnerAndNonce(
  marketPublicKey: PublicKey,
  dexProgramId: PublicKey = DEX_PID,
) {
  const nonce = new BN(0);
  while (nonce.toNumber() < 255) {
    try {
      const vaultOwner = await PublicKey.createProgramAddress(
        [marketPublicKey.toBuffer(), nonce.toArrayLike(Buffer, 'le', 8)],
        dexProgramId,
      );
      return [vaultOwner, nonce];
    } catch (e) {
      nonce.iaddn(1);
    }
  }
  throw new Error('Unable to find nonce');
}
