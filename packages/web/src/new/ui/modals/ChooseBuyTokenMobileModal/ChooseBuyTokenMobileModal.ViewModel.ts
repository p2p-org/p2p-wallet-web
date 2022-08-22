import { injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { CryptoCurrency } from 'new/services/BuyService/structures';
import { WalletsRepository } from 'new/services/Repositories';

@injectable()
export class ChooseBuyTokenMobileModalViewModel extends ViewModel {
  constructor(private _wallets: WalletsRepository) {
    super();
  }

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  getBuySelectionWallet(cryptoCurrency: CryptoCurrency) {
    const wallet = this._wallets
      .getWallets()
      .find(
        (wallet) =>
          wallet.token.symbol === cryptoCurrency.symbol &&
          wallet.token.address === cryptoCurrency.mintAddress,
      );

    /*if (!wallet) {
      await this._solanaSDK
        .getTokensList()
        .then((tokenList) =>
          tokenList.find(
            (token) =>
              token.symbol === cryptoCurrency.symbol &&
              token.address === cryptoCurrency.mintAddress,
          ),
        );
    }*/

    return wallet;
  }
}
