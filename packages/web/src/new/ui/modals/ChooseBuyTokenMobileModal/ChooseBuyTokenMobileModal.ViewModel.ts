import { autorun, makeObservable, observable } from 'mobx';
import { injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { Token, Wallet } from 'new/sdk/SolanaSDK';
import { CryptoCurrency } from 'new/services/BuyService/structures';
import { WalletsRepository } from 'new/services/Repositories';
import { SolanaService } from 'new/services/SolanaService';

@injectable()
export class ChooseBuyTokenMobileModalViewModel extends ViewModel {
  solWallet?: Wallet;
  usdcWallet?: Wallet;

  solToken?: Token;
  usdcToken?: Token;

  constructor(private _wallets: WalletsRepository, private _solanaService: SolanaService) {
    super();

    makeObservable(this, {
      solWallet: observable,
      usdcWallet: observable,

      solToken: observable,
      usdcToken: observable,
    });
  }

  protected override onInitialize() {
    this.addReaction(
      autorun(() => {
        const _solWallet = this._getBuySelectionWallet(CryptoCurrency.sol);
        const _usdcWallet = this._getBuySelectionWallet(CryptoCurrency.usdc);

        if (_solWallet) {
          this._setSOLWallet(_solWallet);
        } else {
          this._getToken(CryptoCurrency.sol).then((token) => token && this._setSOLToken(token));
        }

        if (_usdcWallet) {
          this._setUSDCWallet(_usdcWallet);
        } else {
          this._getToken(CryptoCurrency.usdc).then((token) => token && this._setUSDCToken(token));
        }
      }),
    );
  }

  protected override afterReactionsRemoved() {}

  _setSOLWallet(_solWallet: Wallet) {
    this.solWallet = _solWallet;
  }

  _setUSDCWallet(_usdcWallet: Wallet) {
    this.usdcWallet = _usdcWallet;
  }

  _setSOLToken(_solToken: Token) {
    this.solToken = _solToken;
  }

  _setUSDCToken(_isdcToken: Token) {
    this.usdcToken = _isdcToken;
  }

  _getBuySelectionWallet(cryptoCurrency: CryptoCurrency) {
    const wallet = this._wallets
      .getWallets()
      .find(
        (wallet) =>
          wallet.token.symbol === cryptoCurrency.symbol &&
          wallet.token.address === cryptoCurrency.mintAddress,
      );

    return wallet;
  }

  _getToken(cryptoCurrency: CryptoCurrency): Promise<Token | undefined> {
    return this._solanaService
      .getTokensList()
      .then((tokenList) =>
        tokenList.find(
          (token) =>
            token.symbol === cryptoCurrency.symbol && token.address === cryptoCurrency.mintAddress,
        ),
      );
  }
}
