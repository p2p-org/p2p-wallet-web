import type { u64 } from '@solana/spl-token';
import type { Signer, TransactionInstruction } from '@solana/web3.js';

export class PreparedSwapTransaction {
  instructions: TransactionInstruction[];
  signers: Signer[];
  accountCreationFee: u64;

  constructor({
    instructions,
    signers,
    accountCreationFee,
  }: {
    instructions: TransactionInstruction[];
    signers: Signer[];
    accountCreationFee: u64;
  }) {
    this.instructions = instructions;
    this.signers = signers;
    this.accountCreationFee = accountCreationFee;
  }
}
