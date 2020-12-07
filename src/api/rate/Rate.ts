import { Serializable } from 'utils/types';

export type SerializableRate = {
  market: string;
  price: number;
};

export class Rate implements Serializable<SerializableRate> {
  readonly market: string;

  readonly price: number;

  constructor(market: string, price: number) {
    this.market = market;
    this.price = price;
  }

  toString(): string {
    return this.market;
  }

  serialize(): SerializableRate {
    return {
      market: this.market,
      price: this.price,
    };
  }

  static from(serializableRate: SerializableRate): Rate {
    return new Rate(serializableRate.market, serializableRate.price);
  }
}
