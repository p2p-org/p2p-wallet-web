import type { u64 } from '@solana/spl-token';
import { Token } from '@solana/spl-token';
import type {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  TransactionInstruction,
} from '@solana/web3.js';
import { Account, Transaction } from '@solana/web3.js';

import {
  createAssociatedTokenAccountIx,
  createWSOLAccountInstructions,
} from './instructions/token-instructions';

/**
 * TODO: Deprecate Accounts / Move to sdk's transaction builder structure
 */
export default class TransactionBuilder {
  instructions: TransactionInstruction[];
  cleanupInstructions: TransactionInstruction[];
  signers: Account[];
  keypairSigners: Keypair[];

  constructor() {
    this.instructions = [];
    this.cleanupInstructions = [];
    this.signers = [];
    this.keypairSigners = [];
  }

  addInstruction(instruction: TransactionInstruction) {
    this.instructions.push(instruction);
  }

  createWSOLAccount(
    owner: PublicKey,
    amount: u64,
    accountRentExempt: number,
    tokenProgramId: PublicKey,
    solMint: PublicKey,
  ) {
    const account = new Account();

    this.instructions.push(
      ...createWSOLAccountInstructions(
        account.publicKey,
        owner,
        tokenProgramId,
        solMint,
        amount.toNumber(),
        accountRentExempt,
      ),
    );

    this.cleanupInstructions.push(
      Token.createCloseAccountInstruction(tokenProgramId, account.publicKey, owner, owner, []),
    );

    this.signers.push(account);

    return account;
  }

  async createAssociatedTokenAccount(
    owner: PublicKey,
    tokenMint: PublicKey,
    tokenProgramId: PublicKey,
  ) {
    const [instruction, address] = await createAssociatedTokenAccountIx(
      owner,
      owner,
      tokenMint,
      tokenProgramId,
    );

    this.instructions.push(instruction);

    return address;
  }

  createApproveInstruction(
    userTokenPublicKey: PublicKey,
    authority: Signer,
    owner: PublicKey,
    tokenProgramId: PublicKey,
    amount: u64,
  ) {
    this.instructions.push(
      Token.createApproveInstruction(
        tokenProgramId,
        userTokenPublicKey,
        authority.publicKey,
        owner,
        [],
        amount,
      ),
    );
  }

  async build(connection: Connection, owner: PublicKey) {
    const transaction = new Transaction();
    transaction.add(...this.instructions.concat(this.cleanupInstructions));

    // Transaction must specify `recentBlockhash` to prevent replay attacks
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

    // Generate all required signatures; add owner's signature later
    transaction.setSigners(
      owner,
      ...this.signers.map((s) => s.publicKey),
      ...this.keypairSigners.map((s) => s.publicKey),
    );
    if (this.signers.length > 0) {
      transaction.partialSign(...this.signers);
    }

    if (this.keypairSigners.length > 0) {
      transaction.partialSign(...this.keypairSigners);
    }

    return transaction;
  }
}
