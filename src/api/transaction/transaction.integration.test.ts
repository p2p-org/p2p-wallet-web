import { ExtendedCluster } from 'utils/types';

import { airdropTo } from '../../../test/utils/account';
import { getConnection } from '../connection';
import * as WalletAPI from '../wallet';
import { WalletType } from '../wallet';
import { Wallet } from '../wallet/Wallet';
import { API as TransactionAPI, APIFactory } from '.';

// Increase timeout for tests that send transactions
jest.setTimeout(240000);

const CLUSTER: ExtendedCluster = 'localnet';
let API: TransactionAPI;

describe('api/token integration test', () => {
  let wallet: Wallet;

  beforeAll(async () => {
    wallet = await WalletAPI.connect(CLUSTER, WalletType.LOCAL);
    API = APIFactory(CLUSTER);

    console.log('Airdropping to the wallet');
    // airdrop multiple times so as not to run out of funds.
    // single large airdrops appear to fail
    await airdropTo(getConnection(CLUSTER), wallet.pubkey);
    await airdropTo(getConnection(CLUSTER), wallet.pubkey);
  });

  describe('getTransactionsForAddress', () => {
    it('should do something', async () => {
      const transactions = await API.getTransactionsForAddress(wallet.pubkey);
      console.log(transactions);
    });
  });
});
