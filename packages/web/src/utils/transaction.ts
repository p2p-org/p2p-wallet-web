import type { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { SystemProgram } from '@solana/web3.js';
import type { Layout } from 'buffer-layout';

import { getConnection } from 'api/connection';
import { getWallet } from 'api/wallet';
import type { NetworkType } from 'config/constants';

export const makeNewAccountInstruction = async (
  network: NetworkType,
  newAccountKey: PublicKey,
  layout: Layout,
  programId: PublicKey,
): Promise<TransactionInstruction> => {
  const wallet = getWallet();
  const connection = getConnection(network);
  const balanceNeeded = await connection.getMinimumBalanceForRentExemption(layout.span);

  return SystemProgram.createAccount({
    fromPubkey: wallet.pubkey,
    newAccountPubkey: newAccountKey,
    lamports: balanceNeeded,
    space: layout.span,
    programId,
  });
};
