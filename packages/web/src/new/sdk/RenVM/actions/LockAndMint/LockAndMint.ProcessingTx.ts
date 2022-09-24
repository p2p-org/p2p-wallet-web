import { Type } from 'class-transformer';

import { IncomingTransaction } from './LockAndMint.IncomingTransaction';

enum ValidationType {
  valid = 'valid',
  invalid = 'invalid',
}

export class ValidationStatus {
  type: ValidationType;
  reason?: string;

  private constructor({ type, reason }: { type: ValidationType; reason?: string }) {
    this.type = type;
    this.reason = reason;
  }

  static valid(): ValidationStatus {
    return new ValidationStatus({ type: ValidationType.valid });
  }

  static invalid(reason: string): ValidationStatus {
    return new ValidationStatus({ type: ValidationType.invalid, reason });
  }
}

export interface ProcessingTxType {
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

export class ProcessingTx implements ProcessingTxType {
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
  validationStatus?: ValidationStatus;
  isProcessing?: boolean;

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

  static get maxVote(): number {
    return 3;
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
}
