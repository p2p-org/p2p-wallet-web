import type { Wallet } from 'new/sdk/SolanaSDK';

import type { Info } from './Info';

// The type of transfer in context of current account view.
enum TransferType {
  send = 'send',
  receive = 'receive',
}

// A struct that contains all information about transfer.
export class TransferInfo implements Info {
  // The source account address.
  source?: Wallet | null;

  // The destination account address.
  destination?: Wallet | null;

  authority?: string | null;

  destinationAuthority?: string | null;

  // The amount of transfer
  rawAmount?: number | null;

  // The current account address view.
  //
  // Depends on that will define it's a send or receive transaction.
  account?: string | null;

  constructor({
    source,
    destination,
    authority,
    destinationAuthority,
    rawAmount,
    account,
  }: {
    source?: Wallet | null;
    destination?: Wallet | null;
    authority?: string | null;
    destinationAuthority?: string | null;
    rawAmount?: number | null;
    account?: string | null;
  }) {
    this.source = source;
    this.destination = destination;
    this.authority = authority;
    this.destinationAuthority = destinationAuthority;
    this.rawAmount = rawAmount;
    this.account = account;
  }

  // A current transfer type that depends on account view.
  get transferType(): TransferType | null {
    if (this.source?.pubkey === this.account || this.authority === this.account) {
      return TransferType.send;
    }
    return TransferType.receive;
  }

  // extension

  get amount(): number {
    let amount = this.rawAmount ?? 0;
    if (this.transferType === TransferType.send) {
      amount = -amount;
    }
    return amount;
  }

  get symbol(): string {
    return this.source?.token.symbol ?? this.destination?.token.symbol ?? '';
  }
}
