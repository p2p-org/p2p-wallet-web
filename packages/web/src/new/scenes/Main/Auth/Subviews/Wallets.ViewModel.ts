import { u64 } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { flow } from 'mobx';
import { injectable } from 'tsyringe';

import { SDListViewModel } from 'new/core/viewmodels/SDListViewModel';
import type { GetWalletsConfig } from 'new/scenes/Main/Auth/typings';
import { derivePublicKeyFromSeed } from 'new/scenes/Main/Auth/utils';
import { Wallet } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';

@injectable()
export class WalletsListViewModel extends SDListViewModel<Wallet> {
  private _connection: Connection;
  private _requestConfig: GetWalletsConfig | null = null;
  private static _derivableAccountsNumber = 5;

  constructor() {
    super();

    this._connection = new Connection(Defaults.apiEndpoint.getURL());
  }

  protected override setDefaults() {}

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  // @FIXME flow annotation
  override createRequest = flow<Wallet[], []>(function* (
    this: WalletsListViewModel,
  ): Generator<Promise<Array<Wallet | null>>> {
    const { seed, derivationPathValue } = this._requestConfig as GetWalletsConfig;

    const derivableTokenAccountPublicKeys = new Array(WalletsListViewModel._derivableAccountsNumber)
      .fill(null)
      .map((_, idx) => {
        const pubKey = derivePublicKeyFromSeed(seed, idx, derivationPathValue);
        return new PublicKey(pubKey);
      });

    return yield this._connection
      .getMultipleAccountsInfo(derivableTokenAccountPublicKeys)
      .then((accounts) => {
        // @FIXME ad if correct
        return accounts
          .map((acc, idx) => {
            if (acc) {
              return Wallet.nativeSolana({
                lamports: new u64(acc?.lamports),
                pubkey: derivableTokenAccountPublicKeys[idx]?.toString(),
              });
            }

            return acc;
          })
          .filter(Boolean);
      });
  });

  fetchWallets(config: GetWalletsConfig) {
    this._requestConfig = config;

    this.reload();
  }
}
