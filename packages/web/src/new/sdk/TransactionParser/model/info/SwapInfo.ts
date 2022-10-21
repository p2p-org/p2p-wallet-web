import type { Wallet } from 'new/sdk/SolanaSDK';

import type { Info } from './Info';

// A direction of swap on depends on account symbol view.
enum Direction {
  // The spending swap transaction
  //
  // [A] -> B
  spend = 'spend',

  // The receiving swap transaction
  //
  // A -> [B]
  receive = 'receive',

  // The transaction is intermediate between two tokens.
  //
  // A -> [B] -> C
  transitive = 'transitive',
}

// A struct that contains all information about swapping.
export class SwapInfo implements Info {
  // A source wallet
  source?: Wallet | null;

  // A swapping amount in source wallet
  sourceAmount?: number | null;

  // A destination wallet
  destination?: Wallet | null;

  // A receiving amount in destination wallet
  destinationAmount?: number | null;

  // A account symbol view.
  //
  // Depends on this value will define a direction of transaction
  accountSymbol?: string | null;

  constructor({
    source,
    sourceAmount,
    destination,
    destinationAmount,
    accountSymbol,
  }: {
    source?: Wallet | null;
    sourceAmount?: number | null;
    destination?: Wallet | null;
    destinationAmount?: number | null;
    accountSymbol?: string | null;
  }) {
    this.source = source;
    this.sourceAmount = sourceAmount;
    this.destination = destination;
    this.destinationAmount = destinationAmount;
    this.accountSymbol = accountSymbol;
  }

  static empty(): SwapInfo {
    return new SwapInfo({
      source: null,
      sourceAmount: null,
      destination: null,
      destinationAmount: null,
      accountSymbol: null,
    });
  }

  // Current direction of transaction.
  //
  // This value is calculated using account symbol view
  get direction(): Direction {
    if (this.accountSymbol === this.source?.token.symbol) {
      return Direction.spend;
    }
    if (this.accountSymbol === this.destination?.token.symbol) {
      return Direction.receive;
    }
    return Direction.transitive;
  }

  // extension

  get amount(): number {
    switch (this.direction) {
      case Direction.spend:
        return -(this.sourceAmount ?? 0);
      case Direction.receive:
      case Direction.transitive:
        return this.destinationAmount ?? 0;
    }
  }

  get symbol(): string | undefined {
    switch (this.direction) {
      case Direction.spend:
        return this.source?.token.symbol;
      case Direction.receive:
      case Direction.transitive:
        return this.destination?.token.symbol;
    }
  }
}
