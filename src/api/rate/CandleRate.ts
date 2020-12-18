import { Serializable } from 'utils/types';

export type SerializableCandleRate = {
  market: string;
  price: number;
  startTime: number;
};

export class CandleRate implements Serializable<SerializableCandleRate> {
  readonly market: string;

  readonly price: number;

  readonly startTime: number;

  constructor(market: string, price: number, startTime: number) {
    this.market = market;
    this.price = price;
    this.startTime = startTime;
  }

  toString(): string {
    return this.market;
  }

  serialize(): SerializableCandleRate {
    return {
      market: this.market,
      price: this.price,
      startTime: this.startTime,
    };
  }

  static from(serializableRate: SerializableCandleRate): CandleRate {
    return new CandleRate(
      serializableRate.market,
      serializableRate.price,
      serializableRate.startTime,
    );
  }
}
