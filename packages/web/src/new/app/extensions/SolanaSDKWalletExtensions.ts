import * as SolanaSDK from 'new/app/sdk/SolanaSDK';

export class Wallet extends SolanaSDK.Wallet {
  get mintAddress(): string {
    return this.token.address;
  }
}
