import {
  ParsedInstruction,
  ParsedMessageAccount,
  PartiallyDecodedInstruction,
  PublicKey,
  TransactionError,
  TransactionSignature,
} from '@solana/web3.js';
import { Decimal } from 'decimal.js';

import { SerializableToken, Token } from 'api/token/Token';
import { SerializableTokenAccount, TokenAccount } from 'api/token/TokenAccount';
import { titleCase } from 'utils/common';
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
  type: string | null;
  source: PublicKey | null;
  sourceTokenAccount: TokenAccount | null;
  sourceToken: Token | null;
  destination: PublicKey | null;
  destinationTokenAccount: TokenAccount | null;
  destinationToken: Token | null;
  sourceAmount: Decimal;
  destinationAmount: Decimal;
};

type SerializedShort = {
  type: string | null;
  source: string | null;
  sourceTokenAccount: SerializableTokenAccount | null;
  sourceToken: SerializableToken | null;
  destination: string | null;
  destinationTokenAccount: SerializableTokenAccount | null;
  destinationToken: SerializableToken | null;
  sourceAmount: number;
  destinationAmount: number;
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
  timestamp: number | null | undefined;
  meta: ParsedConfirmedTransactionMeta | null;
  message: SerializedTransactionMessage;
  short: SerializedShort;
};

export class Transaction implements Serializable<SerializableTransaction> {
  readonly signature: TransactionSignature;

  readonly slot: number;

  readonly timestamp: number | null | undefined;

  readonly meta: ParsedConfirmedTransactionMeta | null;

  readonly message: TransactionMessage;

  readonly short: ParsedShort;

  constructor(
    signature: TransactionSignature,
    slot: number,
    timestamp: number | null | undefined,
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

      if ((instruction as PartiallyDecodedInstruction).accounts) {
        (serializedInstruction as SerializedPartiallyDecodedInstruction).accounts = (instruction as PartiallyDecodedInstruction).accounts.map(
          (account) => account.toBase58(),
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
        type: this.short.type || null,
        source: this.short.source?.toBase58() || null,
        sourceTokenAccount: this.short.sourceTokenAccount?.serialize() || null,
        sourceToken:
          this.short.sourceToken?.serialize() ||
          this.short.sourceTokenAccount?.mint.serialize() ||
          null,
        destination: this.short.destination?.toBase58() || null,
        destinationTokenAccount: this.short.destinationTokenAccount?.serialize() || null,
        destinationToken:
          this.short.destinationToken?.serialize() ||
          this.short.destinationTokenAccount?.mint.serialize() ||
          null,
        sourceAmount: this.short.sourceAmount.toNumber(),
        destinationAmount: this.short.destinationAmount.toNumber(),
      },
    };
  }

  details(isSameAccount?: boolean) {
    let { type } = this.short;
    const typeOriginal = type;
    let icon: string | undefined;
    let isReceiver: boolean | undefined = isSameAccount;
    const {
      source,
      destination,
      sourceTokenAccount,
      sourceToken,
      destinationTokenAccount,
      destinationToken,
      sourceAmount,
      destinationAmount,
    } = this.short;
    let amount: Decimal | null = this.short.sourceAmount;
    let tokenAccount: TokenAccount | null = this.short.sourceTokenAccount;
    let token: Token | null = this.short.sourceToken;

    if (type === 'swap') {
      icon = 'swap';
    } else if (type === 'createAccount') {
      icon = 'wallet';
    } else if (type === 'closeAccount') {
      icon = 'bucket';
    } else if (!type) {
      type = 'transaction';
      icon = 'db';
    }

    if (isReceiver) {
      if (type === 'transfer') {
        type = 'receive';
        icon = 'bottom';
      } else if (type !== 'createAccount') {
        amount = this.short.destinationAmount;
        tokenAccount = this.short.destinationTokenAccount;
        token = this.short.destinationToken;
      } else if (type === 'createAccount') {
        isReceiver = false;
      }
    } else if (type === 'transfer') {
      icon = 'top';
    }

    if (type) {
      type = titleCase(type);
    }

    return {
      isReceiver,
      type,
      typeOriginal,
      icon,
      source,
      destination,
      sourceTokenAccount,
      sourceToken,
      destinationTokenAccount,
      destinationToken,
      tokenAccount,
      token,
      sourceAmount,
      destinationAmount,
      amount,
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

        if ((instruction as SerializedPartiallyDecodedInstruction).accounts) {
          (originalInstruction as PartiallyDecodedInstruction).accounts = (instruction as SerializedPartiallyDecodedInstruction).accounts.map(
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
        sourceToken: serializableTransaction.short.sourceToken
          ? Token.from(
              serializableTransaction.short.sourceToken ||
                serializableTransaction.short.sourceTokenAccount?.mint,
            )
          : null,
        destination: serializableTransaction.short.destination
          ? new PublicKey(serializableTransaction.short.destination)
          : null,
        destinationTokenAccount: serializableTransaction.short.destinationTokenAccount
          ? TokenAccount.from(serializableTransaction.short.destinationTokenAccount)
          : null,
        destinationToken: serializableTransaction.short.destinationToken
          ? Token.from(
              serializableTransaction.short.destinationToken ||
                serializableTransaction.short.destinationTokenAccount?.mint,
            )
          : null,
        sourceAmount: new Decimal(serializableTransaction.short.sourceAmount),
        destinationAmount: new Decimal(serializableTransaction.short.destinationAmount),
      },
    );
  }
}
