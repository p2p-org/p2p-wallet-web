import { action, makeObservable, observable, reaction, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { Token, Wallet } from 'new/sdk/SolanaSDK';
import { CryptoCurrency } from 'new/services/BuyService/structures';
import { TokensRepository, WalletsRepository } from 'new/services/Repositories';

@singleton()
export class ChooseBuyTokenMobileModalViewModel extends ViewModel {
  solWallet?: Wallet;
  usdcWallet?: Wallet;

  solToken?: Token;
  usdcToken?: Token;

  constructor(private _wallets: WalletsRepository, private _tokensRepository: TokensRepository) {
    super();

    makeObservable(this, {
      solWallet: observable,
      usdcWallet: observable,

      solToken: observable,
      usdcToken: observable,
    });

    this._setWallets(
      this._getBuySelectionWallet(CryptoCurrency.sol),
      this._getBuySelectionWallet(CryptoCurrency.usdc),
    );
  }

  protected override setDefaults() {}

  protected override onInitialize() {
    this.addReaction(
      reaction(
        () => [
          this._getBuySelectionWallet(CryptoCurrency.sol),
          this._getBuySelectionWallet(CryptoCurrency.usdc),
        ],
        ([newSOLWallet, newUSDCWallet]) => this._setWallets(newSOLWallet, newUSDCWallet),
      ),
    );
  }

  protected override afterReactionsRemoved() {}

  private _getBuySelectionWallet(cryptoCurrency: CryptoCurrency): Wallet | undefined {
    return this._wallets
      .getWallets()
      .find(
        (wallet) =>
          wallet.token.symbol === cryptoCurrency.symbol &&
          wallet.token.address === cryptoCurrency.mintAddress,
      );
  }

  private _getToken(cryptoCurrency: CryptoCurrency): Promise<Token | undefined> {
    return this._tokensRepository.getTokenWithMint(cryptoCurrency.mintAddress);
  }

  private _setWallets(newSOLWallet?: Wallet, newUSDCWallet?: Wallet): void {
    if (newSOLWallet) {
      runInAction(() => (this.solWallet = newSOLWallet));
    } else {
      this._getToken(CryptoCurrency.sol).then(
        action((newSOLToken) => (this.solToken = newSOLToken)),
      );
    }

    if (newUSDCWallet) {
      runInAction(() => (this.usdcWallet = newUSDCWallet));
    } else {
      this._getToken(CryptoCurrency.usdc).then(
        action((newUSDCToken) => (this.usdcToken = newUSDCToken)),
      );
    }
  }
}
