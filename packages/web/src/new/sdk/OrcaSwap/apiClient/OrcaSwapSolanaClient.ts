import type { u64 } from '@solana/spl-token';
import type { Commitment, PublicKey, Signer, TransactionInstruction } from '@solana/web3.js';

import type {
  AccountInstructions,
  FeeCalculator,
  Lamports,
  PreparedTransaction,
  TokenAccountBalance,
} from 'new/sdk/SolanaSDK';
import { SolanaSDK } from 'new/sdk/SolanaSDK';

interface OrcaSwapSolanaClientType {
  getTokenAccountBalance(
    tokenAddress: string,
    commitment?: Commitment,
  ): Promise<TokenAccountBalance>;

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
    owner,
    instructions,
    signers,
    feePayer,
    feeCalculator,
  }: {
    owner: PublicKey;
    instructions: TransactionInstruction[];
    signers?: Signer[];
    feePayer: PublicKey;
    feeCalculator?: FeeCalculator;
  }): Promise<PreparedTransaction>;
}

export class OrcaSwapSolanaClient extends SolanaSDK implements OrcaSwapSolanaClientType {}
