import { Serializable } from 'utils/types';

export type SerializableMarketRate = {
  market: string;
  price: number;
};

export class MarketRate implements Serializable<SerializableMarketRate> {
  readonly market: string;

  readonly price: number;

  constructor(market: string, price: number) {
    this.market = market;
    this.price = price;
  }

  toString(): string {
    return this.market;
  }

  serialize(): SerializableMarketRate {
    return {
      market: this.market,
      price: this.price,
    };
  }

  static from(serializableRate: SerializableMarketRate): MarketRate {
    return new MarketRate(serializableRate.market, serializableRate.price);
  }
}
