import * as web3 from '@solana/web3.js';

class ApiSolanaServiceSingletone {
  connection: web3.Connection | undefined;

  constructor() {
    this.connection = undefined;
  }

  changeEntrypoint(entrypoint: string) {
    this.connection = new web3.Connection(entrypoint);

    return this;
  }

  getConnection() {
    return this.connection;
  }
}

export const ApiSolanaService = new ApiSolanaServiceSingletone();
