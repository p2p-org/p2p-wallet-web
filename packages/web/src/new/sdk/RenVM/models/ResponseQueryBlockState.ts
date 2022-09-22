export class ResponseQueryBlockState {
  //@ts-ignore
  state: State;

  publicKey(mintTokenSymbol: string): string | null {
    if (mintTokenSymbol === V.btc) {
      return this.state.v.btc.shards[0]?.pubKey ?? null;
    }
    return null;
  }
}

class State {
  //@ts-ignore
  t: T;
  //@ts-ignore
  v: V;
}

class T {}

class V {
  //@ts-ignore
  btc: BTCValue;
  //            let bch, btc, dgb, doge: StructBCH?
  //            let fil, luna: StructFIL?
  //            let system: StructSystem?
  //            let zec: StructBCH?

  static get btc(): string {
    return 'BTC';
  }
}

class BTCValue {
  //@ts-ignore
  fees: Fees;
  //@ts-ignore
  gasCap: string;
  //@ts-ignore
  gasLimit: string;
  //@ts-ignore
  gasPrice: string;
  //@ts-ignore
  latestHeight: string;
  //@ts-ignore
  minimumAmount: string;
  //@ts-ignore
  shards: Shard[];
}

class Fees {
  //@ts-ignore
  chains: Chain[];
}

class Chain {
  //@ts-ignore
  burnFee: string;
  //@ts-ignore
  chain: string;
  //@ts-ignore
  mintFee: string;
}

class Shard {
  //@ts-ignore
  pubKey: string;
  //@ts-ignore
  shard: string;
  //@ts-ignore
  state: ShardState;
}

class ShardState {
  //@ts-ignore
  outpoint: Outpoint;
  //@ts-ignore
  pubKeyScript: string;
  //@ts-ignore
  value: string;
}

class Outpoint {
  //@ts-ignore
  hash: string;
  //@ts-ignore
  index: string;
}
