import { u64 } from '@solana/spl-token';
import { Type } from 'class-transformer';

import { convertToBalance } from 'new/sdk/SolanaSDK';
import { numberToString } from 'new/utils/NumberExtensions';

import { LockAndMintIncomingTransaction } from './LockAndMint.IncomingTransaction';

enum ValidationType {
  valid = 'valid',
  invalid = 'invalid',
}

type GroupedTxsType = {
  minted: LockAndMintProcessingTx[];
  submitted: LockAndMintProcessingTx[];
  confirmed: LockAndMintProcessingTx[];
  received: LockAndMintProcessingTx[];
};

export class ValidationStatus {
  private _type: ValidationType;
  private _reason?: string;

  constructor(reason?: string) {
    if (reason) {
      this._type = ValidationType.invalid;
      this._reason = reason;
    } else {
      this._type = ValidationType.valid;
    }
  }

  static valid(): ValidationStatus {
    return new ValidationStatus();
  }

  static invalid(reason: string): ValidationStatus {
    return new ValidationStatus(reason);
  }
}

export type ProcessingTxType = {
  tx: LockAndMintIncomingTransaction;
  receivedAt?: number;
  oneVoteAt?: number;
  twoVoteAt?: number;
  threeVoteAt?: number;
  confirmedAt?: number;
  submittedAt?: number;
  mintedAt?: number;
  validationStatus?: ValidationStatus;
  isProcessing?: boolean;
};

export class LockAndMintProcessingTx implements ProcessingTxType {
  @Type(() => LockAndMintIncomingTransaction)
  //@ts-ignore
  tx: LockAndMintIncomingTransaction;
  receivedAt?: number;
  oneVoteAt?: number;
  twoVoteAt?: number;
  threeVoteAt?: number;
  confirmedAt?: number;
  submittedAt?: number;
  mintedAt?: number;
  @Type(() => ValidationStatus)
  validationStatus = ValidationStatus.valid();
  isProcessing = false;

  constructor(props: ProcessingTxType) {
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
    props.validationStatus && (this.validationStatus = props.validationStatus);
    props.isProcessing && (this.isProcessing = props.isProcessing);
  }

  static get maxVote(): number {
    return 3;
  }

  static grouped(txs: LockAndMintProcessingTx[]): GroupedTxsType {
    return txs.reduce(
      (acc, tx) => {
        if (tx.mintedAt) {
          acc.minted.push(tx);
        }
        if (tx.submittedAt) {
          acc.submitted.push(tx);
        }
        if (tx.confirmedAt) {
          acc.confirmed.push(tx);
        }
        if (tx.receivedAt) {
          acc.received.push(tx);
        }
        return acc;
      },
      { minted: [], submitted: [], confirmed: [], received: [] } as GroupedTxsType,
    );
  }

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
      return `Waiting for deposit confirmation ${this.tx.vout}/${LockAndMintProcessingTx.maxVote}`;
    }

    return '';
  }

  get value(): number {
    return convertToBalance(new u64(this.tx.value), 8);
  }
}
