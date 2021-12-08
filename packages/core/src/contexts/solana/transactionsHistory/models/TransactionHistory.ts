import type { Token } from '@saberhq/token-utils';
import type {
  ParsedInstruction,
  ParsedMessageAccount,
  PartiallyDecodedInstruction,
  PublicKey,
  TransactionError,
  TransactionSignature,
} from '@solana/web3.js';
import type { Decimal } from 'decimal.js';

import type { TokenAccount } from '../../tokenAccounts';
import { titleCase } from '../utils/common';

export type ParsedConfirmedTransactionMeta = {
  fee: number;
  err: TransactionError | null;
};

type Instruction = ParsedInstruction | PartiallyDecodedInstruction;

type TransactionMessage = {
  accountKeys: ParsedMessageAccount[] | undefined;
  instructions: Instruction[] | undefined;
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

export class Transaction {
  readonly signature: TransactionSignature;

  readonly slot: number;

  readonly timestamp: number | null | undefined;

  readonly meta: ParsedConfirmedTransactionMeta | null;

  readonly message: TransactionMessage | null;

  readonly short: ParsedShort;

  constructor(
    signature: TransactionSignature,
    slot: number,
    timestamp: number | null | undefined,
    meta: ParsedConfirmedTransactionMeta | null,
    message: TransactionMessage | null,
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
      if (type === 'swap') {
        amount = this.short.destinationAmount;
        tokenAccount = this.short.destinationTokenAccount;
        token = this.short.destinationToken;
      } else if (type === 'transfer' || type === 'transferChecked') {
        type = 'receive';
        icon = 'bottom';
      } else if (type === 'createAccount') {
        isReceiver = false;
      }
    } else if (type === 'transfer' || type === 'transferChecked') {
      type = 'transfer';
      icon = 'top';
    } else if (type === 'mintRenBTC') {
      icon = 'bottom';
      isReceiver = true;
    } else if (type === 'burnRenBTC') {
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
}
