import { action, computed, makeObservable, observable, runInAction, when } from 'mobx';
import type { ILazyObservable } from 'mobx-utils';
import { lazyObservable } from 'mobx-utils';
import { delay, inject, Lifecycle, scoped } from 'tsyringe';

import { LoadableState } from 'new/app/models/LoadableRelay';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { SelectAddressViewModel } from 'new/scenes/Main/Send/SelectAddress/SelectAddress.ViewModel';
import type * as FeeRelayer from 'new/sdk/FeeRelayer';
import type * as SolanaSDK from 'new/sdk/SolanaSDK';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { FeeAmount } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { WalletsRepository } from 'new/services/Repositories';
import { SendService } from 'new/services/SendService';
import { bitcoinAddress, matches } from 'new/utils/RegularExpression';

import { ChooseTokenAndAmountViewModel, CurrencyMode } from './ChooseTokenAndAmount';

export type Recipient = {
  address: string;
  name: string | null;
  hasNoFunds: boolean;
  hasNoInfo?: boolean; // default false
};

export enum Network {
  solana,
  bitcoin,
}

type FeeInfo = {
  feeAmount: SolanaSDK.FeeAmount;
  feeAmountInSOL: SolanaSDK.FeeAmount;
  hasAvailableWalletToPayFee: boolean;
};

export interface SendViewModelType {
  // SendTokenChooseRecipientAndNetworkViewModelType
  getSelectedWallet(): Wallet | null;
  getPrice(symbol: string): number;
  getPrices(symbols: string[]): Record<string, number>;
  getFreeTransactionFeeLimit(): Promise<FeeRelayer.Relay.FreeTransactionFeeLimit>;

  chooseWallet(wallet: Wallet): void;

  // SendTokenRecipientAndNetworkHandler
  readonly network: Network;
  readonly payingWallet: Wallet | null;
  readonly feeInfo: ILazyObservable<FeeInfo>;
  selectRecipient(recipient: Recipient | null): void;
  selectNetwork(network: Network): void;

  // SendTokenSelectNetworkViewModelType
}

@scoped(Lifecycle.ResolutionScoped)
export class SendViewModel extends ViewModel implements SendViewModelType {
  // Subject

  wallet: Wallet | null = null;
  amount: number | null = null;
  recipient: Recipient | null = null;
  network: Network = Network.solana;
  loadingState = LoadableState.notRequested;
  payingWallet: Wallet | null = null;
  feeInfo: ILazyObservable<FeeInfo> = lazyObservable(() => {}, <FeeInfo>{
    feeAmount: FeeAmount.zero(),
    feeAmountInSOL: FeeAmount.zero(),
    hasAvailableWalletToPayFee: false,
  });

  // ChooseTokenAndAmount
  currencyMode: CurrencyMode = CurrencyMode.token;

  private _walletsLoadPromise: (Promise<void> & { cancel(): void }) | null = null;

  constructor(
    private _pricesService: PricesService,
    private _walletsRepository: WalletsRepository,
    private _sendService: SendService, // TODO: relayMethod in constructor
    public chooseTokenAndAmountViewModel: ChooseTokenAndAmountViewModel,
    @inject(delay(() => SelectAddressViewModel))
    public selectAddressViewModel: Readonly<SelectAddressViewModel>,
  ) {
    super();

    makeObservable(this, {
      wallet: observable,
      amount: observable,
      recipient: observable,
      network: observable,
      loadingState: observable,
      payingWallet: observable,

      currencyMode: observable,

      balanceText: computed,

      selectRecipient: action,
    });
  }

  protected override onInitialize() {
    this.chooseTokenAndAmountViewModel.initialize();
    this.selectAddressViewModel.initialize();

    this._bind();
    this.reload();
  }

  protected override afterReactionsRemoved() {
    this.chooseTokenAndAmountViewModel.end();
    this.selectAddressViewModel.end();

    if (this._walletsLoadPromise) {
      this._walletsLoadPromise.cancel();
    }
  }

  private _bind(): void {
    this._bindFees();
  }

  private _bindFees(): void {
    const payingWallet = this.payingWallet;
    const recipient = this.recipient;
    const network = this.network;

    const wallet = this.getSelectedWallet();
    if (wallet) {
      this.feeInfo = lazyObservable(
        (sink) => {
          this._sendService
            .getFees({
              wallet,
              receiver: recipient?.address,
              network,
              payingTokenMint: payingWallet?.mintAddress,
            })
            .then((_feeAmountInSol) => {
              // if fee is nil, no need to check for available wallets to pay fee
              const feeAmountInSOL = _feeAmountInSol ?? FeeAmount.zero();

              if (feeAmountInSOL.total.eqn(0)) {
                sink(<FeeInfo>{
                  feeAmount: FeeAmount.zero(),
                  feeAmountInSOL: FeeAmount.zero(),
                  hasAvailableWalletToPayFee: true,
                });
                return;
              }

              // else, check available wallets to pay fee
              const payingFeeWallet = payingWallet;
              if (!payingFeeWallet) {
                sink(<FeeInfo>{
                  feeAmount: FeeAmount.zero(),
                  feeAmountInSOL: FeeAmount.zero(),
                  hasAvailableWalletToPayFee: false,
                });
                return;
              }

              Promise.all([
                this._sendService.getAvailableWalletsToPayFee({ feeInSOL: feeAmountInSOL }),
                this._sendService.getFeesInPayingToken({
                  feeInSOL: feeAmountInSOL,
                  payingFeeWallet,
                }),
              ]).then(([wallet, feeAmount]) => {
                sink(<FeeInfo>{
                  feeAmount: feeAmount ?? FeeAmount.zero(),
                  feeAmountInSOL,
                  hasAvailableWalletToPayFee: wallet.length !== 0,
                });
              });
            });
        },
        <FeeInfo>{
          feeAmount: FeeAmount.zero(),
          feeAmountInSOL: FeeAmount.zero(),
          hasAvailableWalletToPayFee: false,
        },
      );
    } else {
      this.feeInfo = lazyObservable(() => {}, <FeeInfo>{
        feeAmount: FeeAmount.zero(),
        feeAmountInSOL: FeeAmount.zero(),
        hasAvailableWalletToPayFee: false,
      });
    }
    this.feeInfo.refresh();
  }

  reload(): void {
    this.loadingState = LoadableState.loading;

    this._walletsLoadPromise = when(() => this._walletsRepository.state === SDFetcherState.loaded);

    Promise.all([this._sendService.load(), this._walletsLoadPromise])
      .then(() => {
        runInAction(() => {
          this.loadingState = LoadableState.loaded;
          if (!this.wallet) {
            this.wallet = this._walletsRepository.nativeWallet;
          }
          const payingWallet = this._walletsRepository
            .getWallets()
            .find((wallet) => wallet.mintAddress === Defaults.payingTokenMint);
          if (payingWallet) {
            this.payingWallet = payingWallet;
          }
        });
      })
      .catch((error) => {
        runInAction(() => {
          this.loadingState = LoadableState.error(error);
        });
      });
  }

  private _send() {
    const wallet = this.wallet;
    const amount = this.amount;
    const recipient = this.recipient;
    if (!wallet || !amount || !recipient) {
      return;
    }

    // modify amount if using source wallet as paying wallet
    const totalFee = this.feeInfo;

    /// TODO:
  }

  /////////////////

  // available amount
  get balanceText(): string | null {
    const wallet = this.wallet;
    const mode = this.currencyMode;

    if (!wallet) {
      return null;
    }

    const amount = this.calculateAvailableAmount();
    if (!amount) {
      return null;
    }

    if (mode === CurrencyMode.fiat) {
      return `${amount.toFixed(2)} ${Defaults.fiat.code}`;
    }

    return amount.formatUnits();
  }

  // SendTokenChooseRecipientAndNetworkViewModelType

  getSelectedWallet(): Wallet | null {
    return this.wallet;
  }

  getPrice(symbol: string): number {
    return this._pricesService.currentPrice(symbol)?.value ?? 0;
  }

  getPrices(symbols: string[]): Record<string, number> {
    const dict: Record<string, number> = {};
    for (const symbol of symbols) {
      dict[symbol] = this.getPrice(symbol);
    }
    return dict;
  }

  getFreeTransactionFeeLimit(): Promise<FeeRelayer.Relay.FreeTransactionFeeLimit> {
    return this._sendService.getFreeTransactionFeeLimit();
  }

  //////

  chooseWallet(wallet: Wallet): void {
    this.wallet = wallet;

    if (!wallet.token.isRenBTC && this.network === Network.bitcoin) {
      this.selectNetwork(Network.solana);
    }
  }

  // SendTokenRecipientAndNetworkHandler

  selectRecipient(recipient: Recipient | null = null): void {
    this.recipient = recipient;

    console.log(333, this.id, recipient);

    if (recipient !== null) {
      if (this._isRecipientBTCAddress()) {
        this.network = Network.bitcoin;
      } else {
        this.network = Network.solana;
      }
    }
  }

  selectNetwork(network: Network): void {
    this.network = network;

    switch (network) {
      case Network.solana: {
        if (this._isRecipientBTCAddress()) {
          this.recipient = null;
        }
        break;
      }
      case Network.bitcoin: {
        if (!this._isRecipientBTCAddress()) {
          this.recipient = null;
        }
      }
    }
  }

  // Helpers

  // TODO:
  private _isRecipientBTCAddress(): boolean {
    const recipient = this.recipient;
    if (!recipient) {
      return false;
    }

    return (
      recipient.name === null &&
      matches(recipient.address, [bitcoinAddress(this._sendService.isTestNet())])
    );
  }
}
