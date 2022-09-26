import { u64 } from '@solana/spl-token';
import { Type } from 'class-transformer';

import { convertToBalance } from 'new/sdk/SolanaSDK';
import { numberToString } from 'new/utils/NumberExtensions';

import { IncomingTransaction } from './LockAndMint.IncomingTransaction';

export enum ValidationStatusType {
  valid = 'valid',
  invalid = 'invalid',
}

export class ValidationStatus {
  type: ValidationStatusType;
  reason?: string;

  private constructor({ type, reason }: { type: ValidationStatusType; reason?: string }) {
    this.type = type;
    this.reason = reason;
  }

  static valid(): ValidationStatus {
    return new ValidationStatus({ type: ValidationStatusType.valid });
  }

  static invalid(reason?: string): ValidationStatus {
    return new ValidationStatus({ type: ValidationStatusType.invalid, reason });
  }
}

interface ProcessingTxType {
  tx: IncomingTransaction;
  receivedAt?: Date;
  oneVoteAt?: Date;
  twoVoteAt?: Date;
  threeVoteAt?: Date;
  confirmedAt?: Date;
  submittedAt?: Date;
  mintedAt?: Date;
  validationStatus?: ValidationStatus;
  isProcessing?: boolean;
}

export class ProcessingTx {
  @Type(() => IncomingTransaction)
  tx: IncomingTransaction;
  receivedAt?: Date;
  oneVoteAt?: Date;
  twoVoteAt?: Date;
  threeVoteAt?: Date;
  confirmedAt?: Date;
  submittedAt?: Date;
  mintedAt?: Date;
  @Type(() => ValidationStatus)
  validationStatus: ValidationStatus;
  isProcessing: boolean;

  constructor({
    tx,
    receivedAt,
    oneVoteAt,
    twoVoteAt,
    threeVoteAt,
    confirmedAt,
    submittedAt,
    mintedAt,
    validationStatus = ValidationStatus.valid(),
    isProcessing = false,
  }: ProcessingTxType) {
    this.tx = tx;
    this.receivedAt = receivedAt;
    this.oneVoteAt = oneVoteAt;
    this.twoVoteAt = twoVoteAt;
    this.threeVoteAt = threeVoteAt;
    this.confirmedAt = confirmedAt;
    this.submittedAt = submittedAt;
    this.mintedAt = mintedAt;
    this.validationStatus = validationStatus;
    this.isProcessing = isProcessing;
  }

  static get maxVote(): u64 {
    return new u64(3);
  }

  static grouped(txs: ProcessingTx[]): {
    minted: ProcessingTx[];
    submitted: ProcessingTx[];
    confirmed: ProcessingTx[];
    received: ProcessingTx[];
  } {
    const minted: ProcessingTx[] = [];
    const submitted: ProcessingTx[] = [];
    const confirmed: ProcessingTx[] = [];
    const received: ProcessingTx[] = [];
    for (const tx of txs) {
      if (tx.mintedAt) {
        minted.push(tx);
      } else if (tx.submittedAt) {
        submitted.push(tx);
      } else if (tx.confirmedAt) {
        confirmed.push(tx);
      } else if (tx.receivedAt) {
        received.push(tx);
      }
    }
    return { minted, submitted, confirmed, received };
  }

  // TODO: extension. must be in client
  get statusString(): string {
    if (this.mintedAt) {
      return `Successfully minted ${numberToString(convertToBalance(new u64(this.tx.value), 8), {
        maximumFractionDigits: 9,
      })} renBTC!`;
    }

    if (this.submittedAt) {
      return 'Minting';
    }

    if (this.confirmedAt) {
      return 'Submitting to RenVM';
    }

    if (this.receivedAt) {
      return `Waiting for deposit confirmation ${this.tx.vout}/${ProcessingTx.maxVote}`;
    }

    return '';
  }

  // TODO: extension. must be in client
  get value(): number {
    return convertToBalance(new u64(this.tx.value), 8);
  }
}
