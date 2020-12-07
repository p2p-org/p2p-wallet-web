import {
  ParsedInstruction,
  ParsedMessageAccount,
  PartiallyDecodedInstruction,
  PublicKey,
  TransactionError,
  TransactionSignature,
} from '@solana/web3.js';

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
  meta: ParsedConfirmedTransactionMeta | null;
  message: SerializedTransactionMessage;
};

export class Transaction implements Serializable<SerializableTransaction> {
  readonly signature: TransactionSignature;

  readonly slot: number;

  readonly meta: ParsedConfirmedTransactionMeta | null;

  readonly message: TransactionMessage;

  constructor(
    signature: TransactionSignature,
    slot: number,
    meta: ParsedConfirmedTransactionMeta | null,
    message: TransactionMessage,
  ) {
    this.signature = signature;
    this.slot = slot;
    this.meta = meta;
    this.message = message;
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
      meta: this.meta,
      message: {
        accountKeys,
        instructions,
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
      },
    );

    return new Transaction(
      serializableTransaction.signature,
      serializableTransaction.slot,
      serializableTransaction.meta,
      { accountKeys, instructions },
    );
  }
}
