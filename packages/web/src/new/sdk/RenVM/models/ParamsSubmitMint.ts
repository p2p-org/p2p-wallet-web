import type { MintTransactionInput } from './MintTransactionInput';

export class ParamsSubmitMint {
  //@ts-ignore
  hash: string;
  //@ts-ignore
  selector: string;
  //@ts-ignore
  version: string;
  //@ts-ignore
  in: In;
}

class In {
  //@ts-ignore
  t: TypeIn;
  //@ts-ignore
  v: MintTransactionInput;
}

export class TypeIn {
  static get struct(): Record<string, string> {
    return {
      txid: 'bytes',
      txindex: 'u32',
      amount: 'u256',
      payload: 'bytes',
      phash: 'bytes32',
      to: 'string',
      nonce: 'bytes32',
      nhash: 'bytes32',
      gpubkey: 'bytes',
      ghash: 'bytes32',
    };
  }
}
