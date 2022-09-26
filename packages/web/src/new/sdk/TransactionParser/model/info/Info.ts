// An abstract interface that allows to calculate the amount of token that the transaction is responsible for.
export interface Info {
  // The amount of token in symbol.
  readonly amount: number;

  // The token symbol.
  readonly symbol?: string;
}
