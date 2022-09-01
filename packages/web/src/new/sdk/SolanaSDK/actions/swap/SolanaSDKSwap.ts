import type { PublicKey, Signer, TransactionInstruction } from '@solana/web3.js';

import type { TransactionID } from 'new/sdk/SolanaSDK';

export class SwapResponse {
  transactionId: TransactionID;
  newWalletPubkey?: string | null;

  constructor({
    transactionId,
    newWalletPubkey,
  }: {
    transactionId: TransactionID;
    newWalletPubkey?: string | null;
  }) {
    this.transactionId = transactionId;
    this.newWalletPubkey = newWalletPubkey;
  }
}

export class AccountInstructions {
  account: PublicKey;
  instructions: TransactionInstruction[];
  cleanupInstructions: TransactionInstruction[];
  signers: Signer[];

  // additionally return new wallet address
  protected newWalletPubkey?: string;
  // additionally return newAccount's secretkey
  protected secretKey?: Uint8Array;

  constructor({
    account,
    instructions = [],
    cleanupInstructions = [],
    signers = [],
    newWalletPubkey,
    secretKey,
  }: {
    account: PublicKey;
    instructions?: TransactionInstruction[];
    cleanupInstructions?: TransactionInstruction[];
    signers?: Signer[];
    newWalletPubkey?: string;
    secretKey?: Uint8Array;
  }) {
    this.account = account;
    this.instructions = instructions;
    this.cleanupInstructions = cleanupInstructions;
    this.signers = signers;
    this.newWalletPubkey = newWalletPubkey;
    this.secretKey = secretKey;
  }
}
