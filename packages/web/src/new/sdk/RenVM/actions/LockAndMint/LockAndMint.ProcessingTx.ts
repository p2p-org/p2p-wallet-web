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
  // @ts-ignore
  type: ValidationStatusType;
  reason?: string;

  private constructor(props: { type: ValidationStatusType; reason?: string }) {
    if (!props) {
      return;
    }

    this.type = props.type;
    this.reason = props.reason;
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
  // @ts-ignore
  tx: IncomingTransaction;
  @Type(() => Date)
  receivedAt?: Date;
  @Type(() => Date)
  oneVoteAt?: Date;
  @Type(() => Date)
  twoVoteAt?: Date;
  @Type(() => Date)
  threeVoteAt?: Date;
  @Type(() => Date)
  confirmedAt?: Date;
  @Type(() => Date)
  submittedAt?: Date;
  @Type(() => Date)
  mintedAt?: Date;
  @Type(() => ValidationStatus)
  // @ts-ignore
  validationStatus: ValidationStatus;
  // @ts-ignore
  isProcessing: boolean;

  constructor(props: ProcessingTxType) {
    // @web: for class-transformer
    if (!props) {
      return;
    }

    this.tx = props.tx;
    this.receivedAt = props.receivedAt;
    this.oneVoteAt = props.oneVoteAt;
    this.twoVoteAt = props.twoVoteAt;
    this.threeVoteAt = props.threeVoteAt;
    this.confirmedAt = props.confirmedAt;
    this.submittedAt = props.submittedAt;
    this.mintedAt = props.mintedAt;
    this.validationStatus = props.validationStatus ?? ValidationStatus.valid();
    this.isProcessing = props.isProcessing ?? false;
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
      return `Successfully minted ${numberToString(convertToBalance(this.tx.value, 8), {
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
    return convertToBalance(this.tx.value, 8);
  }
}
