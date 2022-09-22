export class ResponseQueryTxMint {
  //@ts-ignore
  tx: Tx;
  //@ts-ignore
  txStatus: string;

  get valueOut(): ValueOut {
    return this.tx.out.v;
  }

  get valueIn(): ValueIn {
    return this.tx.in.v;
  }
}

export class Tx {
  //@ts-ignore
  hash: string;
  //@ts-ignore
  version: string;
  //@ts-ignore
  selector: string;
  //@ts-ignore
  in: In;
  //@ts-ignore
  out: Out;
}

class In {
  //@ts-ignore
  v: ValueIn;
}

class ValueIn {
  //@ts-ignore
  amount: string;
  //@ts-ignore
  ghash: string;
  //@ts-ignore
  gpubkey: string;
  //@ts-ignore
  nhash: string;
  //@ts-ignore
  nonce: string;
  //@ts-ignore
  payload: string;
  //@ts-ignore
  phash: string;
  //@ts-ignore
  to: string;
  //@ts-ignore
  txid: string;
  //@ts-ignore
  txindex: string;
}

class Out {
  //@ts-ignore
  t: TypeOut;
  //@ts-ignore
  v: ValueOut;
}

class TypeOut {
  struct?: OutStructType[];
}

class OutStructType {
  hash?: string;
  amount?: string;
  sighash?: string;
  sig?: string;
  txid?: string;
  txindex?: string;
}

class ValueOut {
  amount?: string;
  hash?: string;
  sig?: string;
  sighash?: string;
  txid?: string;
  txindex?: string;
  revert?: string;
}
