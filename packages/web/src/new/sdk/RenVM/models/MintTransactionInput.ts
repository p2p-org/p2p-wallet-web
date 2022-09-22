import { toBase64 } from '@renproject/utils/internal/common';

import { RenVMError } from './RenVMError';
import type { State } from './RenVMState';
import type { Selector } from './Selector';

export class MintTransactionInput {
  txid: string;
  txindex: string;
  ghash: string;
  gpubkey: string;
  nhash: string;
  nonce: string;
  payload: string;
  phash: string;
  to: string;
  amount: string;

  constructor({
    txid,
    txindex,
    ghash,
    gpubkey,
    nhash,
    nonce,
    payload,
    phash,
    to,
    amount,
  }: {
    txid: string;
    txindex: string;
    ghash: string;
    gpubkey: string;
    nhash: string;
    nonce: string;
    payload: string;
    phash: string;
    to: string;
    amount: string;
  }) {
    this.txid = txid;
    this.txindex = txindex;
    this.ghash = ghash;
    this.gpubkey = gpubkey;
    this.nhash = nhash;
    this.nonce = nonce;
    this.payload = payload;
    this.phash = phash;
    this.to = to;
    this.amount = amount;
  }

  static fromBuffer({
    gHash,
    gPubkey,
    nHash,
    nonce,
    amount,
    pHash,
    to,
    txindex,
    txid,
  }: {
    gHash: Uint8Array;
    gPubkey: Uint8Array;
    nHash: Uint8Array;
    nonce: Uint8Array;
    amount: string;
    pHash: Uint8Array;
    to: string;
    txindex: string;
    txid: Uint8Array;
  }): MintTransactionInput {
    return new MintTransactionInput({
      txid: toBase64(txid),
      txindex,
      ghash: toBase64(gHash),
      gpubkey: toBase64(gPubkey),
      nhash: toBase64(nHash),
      nonce: toBase64(nonce),
      payload: '',
      phash: toBase64(pHash),
      to,
      amount,
    });
  }

  static fromState({ state, nonce }: { state: State; nonce: Uint8Array }): MintTransactionInput {
    const { gHash, nHash, amount, pHash, txIndex, txid, sendTo } = state;

    if (!(gHash && nHash && amount && pHash && txIndex && txid && sendTo)) {
      throw RenVMError.paramMissing();
    }
    return new MintTransactionInput({
      txid: toBase64(txid),
      txindex: txIndex,
      ghash: toBase64(gHash),
      gpubkey: state.gPubkey ? toBase64(state.gPubkey) : '',
      nhash: toBase64(nHash),
      nonce: toBase64(nonce),
      payload: '',
      phash: toBase64(pHash),
      to: sendTo,
      amount: amount,
    });
  }

  hash(selector: Selector, version: string): Uint8Array {
    // implement code
    return Uint8Array.of();
  }
}
