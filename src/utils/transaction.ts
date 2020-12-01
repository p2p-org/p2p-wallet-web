import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { Layout } from 'buffer-layout';

import { getConnection } from 'api/connection';
import { getWallet } from 'api/wallet';

import { ExtendedCluster } from './types';

export const makeNewAccountInstruction = async (
  cluster: ExtendedCluster,
  newAccountKey: PublicKey,
  layout: Layout,
  programId: PublicKey,
): Promise<TransactionInstruction> => {
  const wallet = getWallet();
  const connection = getConnection(cluster);
  const balanceNeeded = await connection.getMinimumBalanceForRentExemption(layout.span);

  return SystemProgram.createAccount({
    fromPubkey: wallet.pubkey,
    newAccountPubkey: newAccountKey,
    lamports: balanceNeeded,
    space: layout.span,
    programId,
  });
};
