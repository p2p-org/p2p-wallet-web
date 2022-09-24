import { v2 } from '@renproject/rpc';
import { toURLBase64 } from '@renproject/utils/internal/common';

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
    txIndex,
    txid,
  }: {
    gHash: Uint8Array;
    gPubkey: Uint8Array;
    nHash: Uint8Array;
    nonce: Uint8Array;
    amount: string;
    pHash: Uint8Array;
    to: string;
    txIndex: string;
    txid: Uint8Array;
  }): MintTransactionInput {
    return new MintTransactionInput({
      txid: toURLBase64(txid),
      txindex: txIndex,
      ghash: toURLBase64(gHash),
      gpubkey: toURLBase64(gPubkey),
      nhash: toURLBase64(nHash),
      nonce: toURLBase64(nonce),
      payload: '',
      phash: toURLBase64(pHash),
      to,
      amount,
    });
  }

  static fromState({ state, nonce }: { state: State; nonce: Uint8Array }): MintTransactionInput {
    const { gHash, nHash, amount, pHash, txIndex, txid, sendTo } = state;
    if (!(gHash && nHash && amount && pHash && txIndex && txid && sendTo)) {
      throw RenVMError.paramsMissing();
    }

    return new MintTransactionInput({
      txid: toURLBase64(txid),
      txindex: txIndex,
      ghash: toURLBase64(gHash),
      gpubkey: state.gPubkey ? toURLBase64(state.gPubkey) : '',
      nhash: toURLBase64(nHash),
      nonce: toURLBase64(nonce),
      payload: '',
      phash: toURLBase64(pHash),
      to: sendTo,
      amount: amount,
    });
  }

  hash({ selector, version }: { selector: Selector; version: string }): Uint8Array {
    return v2.hashTransaction(version, selector.toString(), {
      t: v2.mintParamsType(),
      v: {
        txid: this.txid,
        txindex: this.txindex,
        ghash: this.ghash,
        gpubkey: this.gpubkey,
        nhash: this.nhash,
        nonce: this.nonce,
        payload: this.payload,
        phash: this.phash,
        to: this.to,
        amount: this.amount,
      },
    });
  }
}
