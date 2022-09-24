export interface State {
  gHash?: Uint8Array;
  gPubkey?: Uint8Array;
  sendTo?: string; // @ios: PublicKey
  txid?: Uint8Array;
  nHash?: Uint8Array;
  pHash?: Uint8Array;
  txHash?: string;
  txIndex?: string;
  amount?: string;
}
