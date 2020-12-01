import * as web3 from '@solana/web3.js';

const DEFAULT_COMMITMENT: web3.Commitment = 'recent';

class ApiSolanaServiceSingletone {
  connection: web3.Connection | undefined;

  constructor() {
    this.connection = undefined;
  }

  changeEntrypoint(entrypoint: string) {
    this.connection = new web3.Connection(entrypoint, DEFAULT_COMMITMENT);

    return this;
  }

  getConnection() {
    return this.connection;
  }
}

export const ApiSolanaService = new ApiSolanaServiceSingletone();
