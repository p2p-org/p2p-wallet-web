import type { Serializable } from 'utils/types';

export type CandleLimitType = 'last1h' | 'last4h' | 'day' | 'week' | 'month';

export type SerializableCandleRate = {
  market: string;
  type: CandleLimitType;
  price: number;
  startTime: number;
};

export class CandleRate implements Serializable<SerializableCandleRate> {
  readonly market: string;

  readonly type: CandleLimitType;

  readonly price: number;

  readonly startTime: number;

  constructor(market: string, type: CandleLimitType, price: number, startTime: number) {
    this.market = market;
    this.type = type;
    this.price = price;
    this.startTime = startTime;
  }

  toString(): string {
    return this.market;
  }

  serialize(): SerializableCandleRate {
    return {
      market: this.market,
      type: this.type,
      price: this.price,
      startTime: this.startTime,
    };
  }

  static from(serializableRate: SerializableCandleRate): CandleRate {
    return new CandleRate(
      serializableRate.market,
      serializableRate.type,
      serializableRate.price,
      serializableRate.startTime,
    );
  }
}
