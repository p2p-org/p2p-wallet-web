import type { FeeAmount, Wallet } from '../../models';
import { SolanaSDKError } from '../../models';

export enum StatusType {
  requesting,
  processing,
  confirmed,
  error,
}

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

  static requesting(): Status {
    return new Status({ type: StatusType.requesting });
  }

  static processing(percent: number): Status {
    return new Status({ type: StatusType.processing, percent });
  }

  static confirmed(): Status {
    return new Status({ type: StatusType.confirmed });
  }

  static error(error?: string | null): Status {
    return new Status({ type: StatusType.processing, error });
  }

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

export type ParsedTransactionValueType =
  | CreateAccountTransaction
  | CloseAccountTransaction
  | TransferTransaction
  | SwapTransaction;

export class ParsedTransaction {
  status: Status;
  signature?: string | null;
  value?: ParsedTransactionValueType | null;
  amountInFiat?: number | null;
  slot?: number | null;
  blockTime?: Date | null;
  fee?: FeeAmount | null;
  blockhash?: string | null;
  paidByP2POrg = false;

  constructor({
    status,
    signature,
    value,
    amountInFiat = null,
    slot,
    blockTime,
    fee,
    blockhash,
    paidByP2POrg = false,
  }: {
    status: Status;
    signature?: string | null;
    value?:
      | CreateAccountTransaction
      | CloseAccountTransaction
      | TransferTransaction
      | SwapTransaction
      | null;
    amountInFiat?: number | null;
    slot?: number | null;
    blockTime?: Date | null;
    fee?: FeeAmount | null;
    blockhash?: string | null;
    paidByP2POrg?: boolean;
  }) {
    this.status = status;
    this.signature = signature;
    this.value = value;
    this.amountInFiat = amountInFiat;
    this.slot = slot;
    this.blockTime = blockTime;
    this.fee = fee;
    this.blockhash = blockhash;
    this.paidByP2POrg = paidByP2POrg;
  }

  get amount(): number {
    const transaction = this.value;
    switch (transaction?.constructor) {
      case CreateAccountTransaction:
        return -((transaction as CreateAccountTransaction).fee ?? 0);
      case CloseAccountTransaction:
        return (transaction as CloseAccountTransaction).reimbursedAmount ?? 0;
      case TransferTransaction: {
        let amount = (transaction as TransferTransaction).amount ?? 0;
        if ((transaction as TransferTransaction).transferType === TransferType.send) {
          amount = -amount;
        }
        return amount;
      }
      case SwapTransaction: {
        let amount = 0.0;
        switch ((transaction as SwapTransaction).direction) {
          case Direction.spend:
            amount = -((transaction as SwapTransaction).sourceAmount ?? 0);
            break;
          case Direction.receive:
          case Direction.transitiv:
            amount = (transaction as SwapTransaction).destinationAmount ?? 0;
            break;
        }
        return amount;
      }
      default:
        return 0;
    }
  }

  get symbol(): string {
    const transaction = this.value;
    switch (transaction?.constructor) {
      case CreateAccountTransaction:
      case CloseAccountTransaction:
        return 'SOL';
      case TransferTransaction:
        return (
          (transaction as TransferTransaction).source?.token.symbol ??
          (transaction as TransferTransaction).destination?.token.symbol ??
          ''
        );
      case SwapTransaction: {
        switch ((transaction as SwapTransaction).direction) {
          case Direction.spend:
            return (transaction as SwapTransaction).source?.token.symbol ?? '';
          case Direction.receive:
            return (transaction as SwapTransaction).destination?.token.symbol ?? '';
          case Direction.transitiv:
            return (transaction as SwapTransaction).destination?.token.symbol ?? '';
        }
        break;
      }
      default:
        return '';
    }
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

export class CreateAccountTransaction {
  fee?: number | null; // in SOL
  newWallet?: Wallet | null;

  constructor({ fee, newWallet }: { fee?: number | null; newWallet?: Wallet | null }) {
    this.fee = fee;
    this.newWallet = newWallet;
  }

  static empty() {
    return new CreateAccountTransaction({ fee: null, newWallet: null });
  }
}

export class CloseAccountTransaction {
  reimbursedAmount?: number | null;
  closedWallet?: Wallet | null;

  constructor({
    reimbursedAmount,
    closedWallet,
  }: {
    reimbursedAmount?: number | null;
    closedWallet?: Wallet | null;
  }) {
    this.reimbursedAmount = reimbursedAmount;
    this.closedWallet = closedWallet;
  }
}

enum TransferType {
  send,
  receive,
}
export class TransferTransaction {
  source?: Wallet | null;
  destination?: Wallet | null;
  authority?: string | null;
  destinationAuthority?: string | null;
  amount?: number | null;

  myAccount?: string | null;

  constructor({
    source,
    destination,
    authority,
    destinationAuthority,
    amount,
    myAccount,
  }: {
    source?: Wallet | null;
    destination?: Wallet | null;
    authority?: string | null;
    destinationAuthority?: string | null;
    amount?: number | null;
    myAccount?: string | null;
  }) {
    this.source = source;
    this.destination = destination;
    this.authority = authority;
    this.destinationAuthority = destinationAuthority;
    this.amount = amount;
    this.myAccount = myAccount;
  }

  get transferType(): TransferType | null {
    if (this.source?.pubkey === this.myAccount || this.authority === this.myAccount) {
      return TransferType.send;
    }
    return TransferType.receive;
  }
}

enum Direction {
  spend,
  receive,
  transitiv,
}
export class SwapTransaction {
  // source
  source?: Wallet | null;
  sourceAmount?: number | null;

  // destination
  destination?: Wallet | null;
  destinationAmount?: number | null;

  myAccountSymbol?: string | null;

  constructor({
    source,
    sourceAmount,
    destination,
    destinationAmount,
    myAccountSymbol,
  }: {
    source?: Wallet | null;
    sourceAmount?: number | null;
    destination?: Wallet | null;
    destinationAmount?: number | null;
    myAccountSymbol?: string | null;
  }) {
    this.source = source;
    this.sourceAmount = sourceAmount;
    this.destination = destination;
    this.destinationAmount = destinationAmount;
    this.myAccountSymbol = myAccountSymbol;
  }

  get empty(): SwapTransaction {
    return new SwapTransaction({
      source: null,
      sourceAmount: null,
      destination: null,
      destinationAmount: null,
      myAccountSymbol: null,
    });
  }

  get direction(): Direction {
    if (this.myAccountSymbol === this.source?.token.symbol) {
      return Direction.spend;
    }
    if (this.myAccountSymbol === this.destination?.token.symbol) {
      return Direction.receive;
    }
    return Direction.transitiv;
  }
}
