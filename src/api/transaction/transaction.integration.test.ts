import { prop } from 'ramda';

import { ExtendedCluster } from 'utils/types';

import { airdropTo } from '../../../test/utils/account';
import { getConnection } from '../connection';
import { API as TokenAPI, APIFactory } from '../token';
import { Token } from '../token/Token';
import { TokenAccount } from '../token/TokenAccount';
import * as WalletAPI from '../wallet';
import { WalletType } from '../wallet';
import { Wallet } from '../wallet/Wallet';

// Increase timeout for tests that send transactions
jest.setTimeout(240000);

const CLUSTER: ExtendedCluster = 'localnet';
let API: TokenAPI;

describe('api/token integration test', () => {
  let wallet: Wallet;
  let token: Token;
  let tokenAccount: TokenAccount;

  beforeAll(async () => {
    wallet = await WalletAPI.connect(CLUSTER, WalletType.LOCAL);
    API = APIFactory(CLUSTER);

    console.log('Airdropping to the wallet');
    // airdrop multiple times so as not to run out of funds.
    // single large airdrops appear to fail
    await airdropTo(getConnection(CLUSTER), wallet.pubkey);
    await airdropTo(getConnection(CLUSTER), wallet.pubkey);
  });

  describe('getAccountsForToken', () => {
    it('should find the token account', async () => {
      const foundAccounts = await API.getAccountsForToken(token);
      expect(foundAccounts[0]).toBeEqualByMethodTo(tokenAccount);
    });
  });

  describe('getAccountsForWallet', () => {
    it('should include the token account', async () => {
      const foundAccounts = await API.getAccountsForWallet();
      expect(foundAccounts.map(prop('address'))).toContainEqual(tokenAccount.address);
    });
  });
});
