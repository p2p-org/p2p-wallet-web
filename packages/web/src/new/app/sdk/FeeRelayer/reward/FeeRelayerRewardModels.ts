import type { Lamports } from 'new/app/sdk/SolanaSDK';

// Transfer SOL
export class TransferSolParams {
  sender: string;
  recipient: string;
  amount: Lamports;
  signature: string;
  blockhash: string;

  constructor({
    sender,
    recipient,
    amount,
    signature,
    blockhash,
  }: {
    sender: string;
    recipient: string;
    amount: Lamports;
    signature: string;
    blockhash: string;
  }) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.signature = signature;
    this.blockhash = blockhash;
  }

  toJSON() {
    return {
      sender_pubkey: this.sender,
      recipient_pubkey: this.recipient,
      lamports: this.amount,
      signature: this.signature,
      blockhash: this.blockhash,
    };
  }
}

// Transfer SPL Tokens
export class TransferSPLTokenParams {
  sender: string;
  recipient: string;
  mintAddress: string;
  authority: string;
  amount: Lamports;
  decimals: number;
  signature: string;
  blockhash: string;

  constructor({
    sender,
    recipient,
    mintAddress,
    authority,
    amount,
    decimals,
    signature,
    blockhash,
  }: {
    sender: string;
    recipient: string;
    mintAddress: string;
    authority: string;
    amount: Lamports;
    decimals: number;
    signature: string;
    blockhash: string;
  }) {
    this.sender = sender;
    this.recipient = recipient;
    this.mintAddress = mintAddress;
    this.authority = authority;
    this.amount = amount;
    this.decimals = decimals;
    this.signature = signature;
    this.blockhash = blockhash;
  }

  toJSON() {
    return {
      sender_token_account_pubkey: this.sender,
      recipient_pubkey: this.recipient,
      token_mint_pubkey: this.mintAddress,
      authority_pubkey: this.authority,
      amount: this.amount,
      decimals: this.decimals,
      signature: this.signature,
      blockhash: this.blockhash,
    };
  }
}
