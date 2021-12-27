import { Token as SPLToken, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';
import { memoizeWith, toString } from 'ramda';

export interface API {
  closeAccount: (publicKey: PublicKey) => Promise<string>;
}

// The API is a singleton per cluster. This ensures requests can be cached
export const APIFactory = memoizeWith(toString, (): API => {
  const closeAccount = async (publicKey: PublicKey): Promise<string> => {
    const closeAccountInstruction = SPLToken.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      publicKey,
      getWallet().pubkey,
      getWallet().pubkey,
      [],
    );

    const transaction = await makeTransaction([closeAccountInstruction]);

    return sendTransaction(transaction, false);
  };

  return {
    closeAccount,
  };
});
