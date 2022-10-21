import { Type } from 'class-transformer';

class Outpoint {
  // @ts-ignore
  hash: string;
  // @ts-ignore
  index: string;
}

class ShardState {
  @Type(() => Outpoint)
  // @ts-ignore
  outpoint: Outpoint;
  // @ts-ignore
  pubKeyScript: string;
  // @ts-ignore
  value: string;
}

class Shard {
  // @ts-ignore
  pubKey: string;
  // @ts-ignore
  shard: string;
  @Type(() => ShardState)
  // @ts-ignore
  state: ShardState;
}

class Chain {
  // @ts-ignore
  burnFee: string;
  // @ts-ignore
  chain: string;
  // @ts-ignore
  mintFee: string;
}

class Fees {
  @Type(() => Chain)
  // @ts-ignore
  chains: Chain[];
}

class BTCValue {
  @Type(() => Fees)
  // @ts-ignore
  fees: Fees;
  // @ts-ignore
  gasCap: string;
  // @ts-ignore
  gasLimit: string;
  // @ts-ignore
  gasPrice: string;
  // @ts-ignore
  latestHeight: string;
  // @ts-ignore
  minimumAmount: string;
  @Type(() => Shard)
  // @ts-ignore
  shards: Shard[];
}

class V {
  @Type(() => BTCValue)
  // @ts-ignore
  BTC: BTCValue;
  // @ios:
  // let bch, btc, dgb, doge: StructBCH?
  // let fil, luna: StructFIL?
  // let system: StructSystem?
  // let zec: StructBCH?

  get btc(): BTCValue {
    return this.BTC;
  }
}

class T {}

class State {
  @Type(() => T)
  // @ts-ignore
  t: T;
  @Type(() => V)
  // @ts-ignore
  v: V;
}

export class ResponseQueryBlockState {
  @Type(() => State)
  // @ts-ignore
  state: State;

  publicKey(mintTokenSymbol: string): string | null {
    if (mintTokenSymbol === 'BTC') {
      return this.state.v.btc.shards[0]?.pubKey ?? null;
    }
    return null;
  }
}
