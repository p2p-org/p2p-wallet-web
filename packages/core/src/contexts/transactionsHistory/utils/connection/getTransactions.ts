import type { Connection, PublicKey, SignaturesForAddressOptions } from '@solana/web3.js';

export const getTransactionSignatures = async (
  connection: Connection,
  ownerAddress: PublicKey,
  options: SignaturesForAddressOptions,
) => {
  return await connection
    .getSignaturesForAddress(ownerAddress, options, 'confirmed')
    .catch((error: Error) => {
      console.error(`Error getting transaction signatures for ${ownerAddress.toBase58()}`, error);
      throw error;
    });
};
