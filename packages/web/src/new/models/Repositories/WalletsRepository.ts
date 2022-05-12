import type { AccountInfo, PublicKey } from '@solana/web3.js';
import { makeObservable, observable, runInAction } from 'mobx';
import { Lifecycle, scoped } from 'tsyringe';

import { SolanaSDKPublicKey } from 'new/app/sdk/SolanaSDK';

import { Model } from '../Model';
import { SolanaModel } from '../Solana/SolanaModel';

@scoped(Lifecycle.ContainerScoped)
export class WalletsRepository extends Model {
  isInitialized = false;
  tokens: { pubkey: PublicKey; account: AccountInfo<Buffer> }[] = [];

  constructor(protected solanaModel: SolanaModel) {
    super();
    makeObservable(this, {
      isInitialized: observable,
      tokens: observable,
    });
  }

  protected onInitialize(): void {
    this.isInitialized = false;
    this.solanaModel.initialize();
    this._update().then(() => {
      runInAction(() => (this.isInitialized = true));
    });
  }

  protected override afterReactionsRemoved() {
    this.solanaModel.end();
  }

  private async _update() {
    const tokens = await this.solanaModel.connection.getTokenAccountsByOwner(
      this.solanaModel.provider.wallet.publicKey,
      {
        programId: SolanaSDKPublicKey.tokenProgramId,
      },
    );

    runInAction(() => {
      this.tokens = tokens.value;
    });
  }
}
