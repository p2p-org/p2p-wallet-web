export class State {
  gHash?: Uint8Array;
  gPubkey?: Uint8Array;
  sendTo?: string; // PublicKey
  txid?: Uint8Array;
  nHash?: Uint8Array;
  pHash?: Uint8Array;
  txHash?: string;
  txIndex?: string;
  amount?: string;

  constructor({
    gHash,
    gPubkey,
    sendTo,
    txid,
    nHash,
    pHash,
    txHash,
    txIndex,
    amount,
  }: {
    gHash?: Uint8Array;
    gPubkey?: Uint8Array;
    sendTo?: string; // PublicKey
    txid?: Uint8Array;
    nHash?: Uint8Array;
    pHash?: Uint8Array;
    txHash?: string;
    txIndex?: string;
    amount?: string;
  }) {
    this.gHash = gHash;
    this.gPubkey = gPubkey;
    this.sendTo = sendTo;
    this.txid = txid;
    this.nHash = nHash;
    this.pHash = pHash;
    this.txHash = txHash;
    this.txIndex = txIndex;
    this.amount = amount;
  }
}
