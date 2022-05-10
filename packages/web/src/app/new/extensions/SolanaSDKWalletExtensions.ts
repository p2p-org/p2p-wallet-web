import * as SolanaSDK from 'app/new/sdk/SolanaSDK';

export class Wallet extends SolanaSDK.Wallet {
  get mintAddress(): string {
    return this.token.address;
  }
}
