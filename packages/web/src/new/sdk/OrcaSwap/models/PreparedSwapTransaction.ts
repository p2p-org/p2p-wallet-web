import type { u64 } from '@solana/spl-token';
import type { PublicKey, Signer, TransactionInstruction } from '@solana/web3.js';

export class PreparedSwapTransaction {
  owner: PublicKey;
  instructions: TransactionInstruction[];
  signers: Signer[];
  accountCreationFee: u64;

  constructor({
    owner,
    instructions,
    signers = [],
    accountCreationFee,
  }: {
    owner: PublicKey;
    instructions: TransactionInstruction[];
    signers?: Signer[];
    accountCreationFee: u64;
  }) {
    this.owner = owner;
    this.instructions = instructions;
    this.signers = signers;
    this.accountCreationFee = accountCreationFee;
  }
}
