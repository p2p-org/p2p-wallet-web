export class MintToken {
  name: string;
  symbol: string;

  constructor(name: string, symbol: string) {
    this.name = name;
    this.symbol = symbol;
  }

  static get bitcoin(): MintToken {
    return new MintToken('Bitcoin', 'BTC');
  }
}
