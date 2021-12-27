import { ZERO } from '@orca-so/sdk';
import type { AccountInfo, u64 } from '@solana/spl-token';
import type { Connection, PublicKey } from '@solana/web3.js';
import { Account } from '@solana/web3.js';

export default class TokenAccount {
  connection: Connection;
  account: PublicKey;
  accountInfo: AccountInfo;

  constructor(connection: Connection, account: PublicKey, accountInfo: AccountInfo) {
    this.connection = connection;
    this.account = account;
    this.accountInfo = accountInfo;
  }

  getAmount(): u64 {
    return this.accountInfo.amount;
  }

  static createWrappedSolAccount(
    connection: Connection,
    owner: PublicKey,
    solMint: PublicKey,
    amount: u64,
  ) {
    const dummyAccount = new Account();
    return new TokenAccount(connection, dummyAccount.publicKey, {
      mint: solMint,
      address: dummyAccount.publicKey,
      owner,
      amount,
      delegate: null,
      delegatedAmount: ZERO,
      isInitialized: false,
      isFrozen: false,
      isNative: false,
      rentExemptReserve: null,
      closeAuthority: null,
    });
  }
}
