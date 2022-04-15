import type { u64 } from '@solana/spl-token';
import type {
  Commitment,
  PublicKey,
  RpcResponseAndContext,
  Signer,
  TokenAmount,
  TransactionInstruction,
} from '@solana/web3.js';

import type { AccountInstructions, Lamports, PreparedTransaction } from 'app/sdk/SolanaSDK';
import { SolanaSDK } from 'app/sdk/SolanaSDK';

interface OrcaSwapSolanaClientType {
  getTokenAccountBalance(
    tokenAddress: PublicKey,
    commitment?: Commitment,
  ): Promise<RpcResponseAndContext<TokenAmount>>;

  getMinimumBalanceForRentExemption(span: number): Promise<u64>;

  checkIfAssociatedTokenAccountExists(owner: PublicKey, mint: string): Promise<boolean>;

  prepareCreatingWSOLAccountAndCloseWhenDone(
    owner: PublicKey,
    amount: Lamports,
    payer: PublicKey,
  ): Promise<AccountInstructions>;

  prepareForCreatingAssociatedTokenAccount(
    owner: PublicKey,
    mint: PublicKey,
    feePayer: PublicKey,
    closeAfterward: boolean,
  ): Promise<AccountInstructions>;

  serializeAndSend({
    preparedTransaction,
    isSimulation,
  }: {
    preparedTransaction: PreparedTransaction;
    isSimulation: boolean;
  }): Promise<string>;

  prepareTransaction({
    instructions,
    signers,
    feePayer,
    accountsCreationFee,
    recentBlockhash,
  }: {
    instructions: TransactionInstruction[];
    signers: Signer[];
    feePayer: PublicKey;
    accountsCreationFee: Lamports;
    recentBlockhash?: string | null;
  }): Promise<PreparedTransaction>;
}

export class OrcaSwapSolanaClient extends SolanaSDK implements OrcaSwapSolanaClientType {}
