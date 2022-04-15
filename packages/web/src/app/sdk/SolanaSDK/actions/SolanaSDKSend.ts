import type { PublicKey } from '@solana/web3.js';

export class SPLTokenDestinationAddress {
  destination: PublicKey;
  isUnregisteredAsocciatedToken: boolean;

  constructor({
    destination,
    isUnregisteredAsocciatedToken,
  }: {
    destination: PublicKey;
    isUnregisteredAsocciatedToken: boolean;
  }) {
    this.destination = destination;
    this.isUnregisteredAsocciatedToken = isUnregisteredAsocciatedToken;
  }
}
