import type { FeeAmount } from 'new/sdk/SolanaSDK';
import { SolanaSDKError } from 'new/sdk/SolanaSDK';

import type { CloseAccountInfo, CreateAccountInfo, SwapInfo, TransferInfo } from './info';

export enum StatusType {
  requesting = 'requesting',
  processing = 'processing',
  confirmed = 'confirmed',
  error = 'error',
}

// The enum of possible status of transaction in blockchain
export class Status {
  type: StatusType;
  private _percent?: number | null;
  private _error?: string | null;

  private constructor({
    type,
    percent,
    error,
  }: {
    type: StatusType;
    percent?: number | null;
    error?: string | null;
  }) {
    this.type = type;
    this._percent = percent;
    this._error = error;
  }

  // The transaction is in requesting process. The transaction can be being prepared or submitted.
  static requesting(): Status {
    return new Status({ type: StatusType.requesting });
  }

  // The transaction is processed by blockchain.
  static processing(percent: number): Status {
    return new Status({ type: StatusType.processing, percent });
  }

  // The transaction has been done processed and is a part of blockchain
  static confirmed(): Status {
    return new Status({ type: StatusType.confirmed });
  }

  // The transaction has been done processed but finished with error.
  static error(error?: string | null): Status {
    return new Status({ type: StatusType.error, error });
  }

  // Convert the status as error.
  get getError(): Error | null {
    switch (this.type) {
      case StatusType.error:
        if (this._error) {
          return SolanaSDKError.other(this._error);
        }
        return null;
      default:
        break;
    }
    return null;
  }

  // The raw string value
  get rawValue(): string {
    switch (this.type) {
      case StatusType.requesting:
        return 'requesting';
      case StatusType.processing:
        return 'processing';
      case StatusType.confirmed:
        return 'confirmed';
      case StatusType.error:
        return 'error';
    }
  }
}

export type ParsedTransactionInfoType =
  | CreateAccountInfo
  | CloseAccountInfo
  | TransferInfo
  | SwapInfo;

// A parsed transaction struct. Useful for display to regular users
export class ParsedTransaction {
  // Current status of transaction.
  status: Status;

  // A transaction signature
  signature?: string | null;

  // A detailed information about this transaction.
  //
  // For example the information about create account transaction is a fee amount and new created wallet,
  // transfer - amount of transferred lamport, source, destination address, etc.
  info?: ParsedTransactionInfoType | null;

  // The current amount of value in fiat.
  amountInFiat?: number | null;

  // The slot this transaction was processed in.
  slot?: number | null;

  // Estimated production time, as Unix timestamp (seconds since the Unix epoch) of when the transaction was processed.
  // Nil if not available.
  blockTime?: Date | null;

  // The fee amount this transaction was charged.
  fee?: FeeAmount | null;

  // The blockhash of this block
  blockhash?: string | null;

  // The bool value that indicates the fee was covered by the p2p validator.
  paidByP2POrg = false;

  constructor({
    status,
    signature,
    info,
    amountInFiat = null,
    slot,
    blockTime,
    fee,
    blockhash,
    paidByP2POrg = false,
  }: {
    status: Status;
    signature?: string | null;
    info?: ParsedTransactionInfoType | null;
    amountInFiat?: number | null;
    slot?: number | null;
    blockTime?: Date | null;
    fee?: FeeAmount | null;
    blockhash?: string | null;
    paidByP2POrg?: boolean;
  }) {
    this.status = status;
    this.signature = signature;
    this.info = info;
    this.amountInFiat = amountInFiat;
    this.slot = slot;
    this.blockTime = blockTime;
    this.fee = fee;
    this.blockhash = blockhash;
    this.paidByP2POrg = paidByP2POrg;
  }

  get amount(): number {
    const info = this.info;
    if (info) {
      return info.amount ?? 0;
    }
    return 0;
  }

  get symbol(): string {
    const info = this.info;
    if (info) {
      return info.symbol ?? '';
    }
    return '';
  }

  get isProcessing(): boolean {
    switch (this.status.type) {
      case StatusType.requesting:
      case StatusType.processing:
        return true;
      default:
        return false;
    }
  }

  get isFailure(): boolean {
    switch (this.status.type) {
      case StatusType.error:
        return true;
      default:
        return false;
    }
  }
}
