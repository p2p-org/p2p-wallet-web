import {
  ParsedInstruction,
  ParsedMessageAccount,
  PartiallyDecodedInstruction,
  PublicKey,
  TransactionError,
  TransactionSignature,
} from '@solana/web3.js';
import { Decimal } from 'decimal.js';

import { SerializableTokenAccount, TokenAccount } from 'api/token/TokenAccount';
import { Serializable } from 'utils/types';

export type ParsedConfirmedTransactionMeta = {
  fee: number;
  err: TransactionError | null;
};

type Instruction = ParsedInstruction | PartiallyDecodedInstruction;

type TransactionMessage = {
  accountKeys: ParsedMessageAccount[];
  instructions: Instruction[];
};

type ParsedShort = {
  type: string;
  source: PublicKey | null;
  sourceTokenAccount: TokenAccount | null;
  amount: Decimal;
};

type SerializedShort = {
  type: string;
  source: string | null;
  sourceTokenAccount: SerializableTokenAccount | null;
  amount: number;
};

type SerializedParsedInstruction = {
  programId: string;
  program: string;
  parsed: string;
};

type SerializedPartiallyDecodedInstruction = {
  programId: string;
  accounts: Array<string>;
  data: string;
};

type SerializedAccountKeys = {
  pubkey: string;
  signer: boolean;
  writable: boolean;
};

type SerializedInstruction = SerializedParsedInstruction | SerializedPartiallyDecodedInstruction;

type SerializedTransactionMessage = {
  accountKeys: SerializedAccountKeys[];
  instructions: SerializedInstruction[];
};

export type SerializableTransaction = {
  signature: string;
  slot: number;
  timestamp: number | null;
  meta: ParsedConfirmedTransactionMeta | null;
  message: SerializedTransactionMessage;
  short: SerializedShort;
};

export class Transaction implements Serializable<SerializableTransaction> {
  readonly signature: TransactionSignature;

  readonly slot: number;

  readonly timestamp: number | null;

  readonly meta: ParsedConfirmedTransactionMeta | null;

  readonly message: TransactionMessage;

  readonly short: ParsedShort;

  constructor(
    signature: TransactionSignature,
    slot: number,
    timestamp: number | null,
    meta: ParsedConfirmedTransactionMeta | null,
    message: TransactionMessage,
    short: ParsedShort,
  ) {
    this.signature = signature;
    this.slot = slot;
    this.timestamp = timestamp;
    this.meta = meta;
    this.message = message;
    this.short = short;
  }

  toString(): string {
    return this.signature;
  }

  serialize(): SerializableTransaction {
    const accountKeys: SerializedAccountKeys[] = this.message.accountKeys.map((key) => ({
      ...key,
      pubkey: key.pubkey.toBase58(),
    }));

    const instructions: SerializedInstruction[] = this.message.instructions.map((instruction) => {
      const serializedInstruction = <SerializedInstruction>{
        ...instruction,
        programId: instruction.programId.toBase58(),
      };

      if (instruction.accounts) {
        serializedInstruction.accounts = serializedInstruction.accounts.map((account) =>
          account.toBase58(),
        );
      }

      return serializedInstruction;
    });

    return {
      signature: this.signature,
      slot: this.slot,
      timestamp: this.timestamp,
      meta: this.meta,
      message: {
        accountKeys,
        instructions,
      },
      short: {
        type: this.short.type,
        source: this.short.source?.toBase58() || null,
        sourceTokenAccount: this.short.sourceTokenAccount?.serialize() || null,
        amount: this.short.amount.toNumber(),
      },
    };
  }

  static from(serializableTransaction: SerializableTransaction): Transaction {
    const accountKeys: ParsedMessageAccount[] = serializableTransaction.message.accountKeys.map(
      (key) => ({
        ...key,
        pubkey: new PublicKey(key.pubkey),
      }),
    );

    const instructions: Instruction[] = serializableTransaction.message.instructions.map(
      (instruction) => {
        const originalInstruction = <Instruction>{
          ...instruction,
          programId: new PublicKey(instruction.programId),
        };

        if (instruction.accounts) {
          originalInstruction.accounts = originalInstruction.accounts.map(
            (account) => new PublicKey(account),
          );
        }

        return originalInstruction;
      },
    );

    return new Transaction(
      serializableTransaction.signature,
      serializableTransaction.slot,
      serializableTransaction.timestamp,
      serializableTransaction.meta,
      { accountKeys, instructions },
      {
        type: serializableTransaction.short.type,
        source: serializableTransaction.short.source
          ? new PublicKey(serializableTransaction.short.source)
          : null,
        sourceTokenAccount: serializableTransaction.short.sourceTokenAccount
          ? TokenAccount.from(serializableTransaction.short.sourceTokenAccount)
          : null,
        amount: new Decimal(serializableTransaction.short.amount),
      },
    );
  }
}
