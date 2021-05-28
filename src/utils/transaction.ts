import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { Layout } from 'buffer-layout';

import { getConnection } from 'api/connection';
import { getWallet } from 'api/wallet';
import { NetworkType } from 'config/constants';

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
