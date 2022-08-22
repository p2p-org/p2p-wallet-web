import { ZERO } from '@orca-so/sdk';
import { action, computed, makeObservable, observable, reaction, runInAction, when } from 'mobx';
import { delay, inject, Lifecycle, scoped } from 'tsyringe';

import { LoadableRelay, LoadableState } from 'new/app/models/LoadableRelay';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { SelectAddressError } from 'new/scenes/Main/Send/SelectAddress/SelectAddress.ViewModel';
import { SelectAddressViewModel } from 'new/scenes/Main/Send/SelectAddress/SelectAddress.ViewModel';
import type * as FeeRelayer from 'new/sdk/FeeRelayer';
import type * as SolanaSDK from 'new/sdk/SolanaSDK';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { convertToBalance, FeeAmount } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { ModalService, ModalType } from 'new/services/ModalService';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { WalletsRepository } from 'new/services/Repositories';
import { RelayMethod, SendService } from 'new/services/SendService';
import { bitcoinAddress, matches } from 'new/utils/RegularExpression';

import type { ChooseTokenAndAmountError } from './ChooseTokenAndAmount';
import { ChooseTokenAndAmountViewModel } from './ChooseTokenAndAmount';

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

export type FeeInfo = {
  feeAmount: SolanaSDK.FeeAmount;
  feeAmountInSOL: SolanaSDK.FeeAmount;
  hasAvailableWalletToPayFee: boolean;
};

export interface SendViewModelType {
  // SendTokenChooseRecipientAndNetworkViewModelType
  get getSelectedWallet(): Wallet | null;
  getPrice(symbol: string): number;
  getPrices(symbols: string[]): Record<string, number>;
  getFreeTransactionFeeLimit(): Promise<FeeRelayer.Relay.FreeTransactionFeeLimit>;

  chooseWallet(wallet: Wallet): void;

  readonly wallet: Wallet | null;
  // SendTokenRecipientAndNetworkHandler
  readonly network: Network;
  readonly payingWallet: Wallet | null;
  readonly feeInfo: LoadableRelay<FeeInfo>;
  selectRecipient(recipient: Recipient | null): void;
  selectNetwork(network: Network): void;

  // SendTokenSelectNetworkViewModelType
}

@scoped(Lifecycle.ResolutionScoped)
export class SendViewModel extends ViewModel implements SendViewModelType {
  // Subject

  wallet: Wallet | null = null;
  amount = 0;
  recipient: Recipient | null = null;
  network: Network = Network.solana;
  loadingState = LoadableState.notRequested;
  payingWallet: Wallet | null = null;
  feeInfo: LoadableRelay<FeeInfo> = new LoadableRelay<FeeInfo>(
    Promise.resolve({
      feeAmount: FeeAmount.zero(),
      feeAmountInSOL: FeeAmount.zero(),
      hasAvailableWalletToPayFee: false,
    }),
  );
  relayMethod: RelayMethod;

  // ChooseTokenAndAmount
  // currencyMode: CurrencyMode = CurrencyMode.token;

  private _walletsLoadPromise: (Promise<void> & { cancel(): void }) | null = null;

  constructor(
    private _pricesService: PricesService,
    private _walletsRepository: WalletsRepository,
    private _sendService: SendService,
    public chooseTokenAndAmountViewModel: ChooseTokenAndAmountViewModel,
    @inject(delay(() => SelectAddressViewModel))
    public selectAddressViewModel: Readonly<SelectAddressViewModel>,
    private _modalService: ModalService,
  ) {
    super();

    // TODO: relayMethod in constructor
    this.relayMethod = RelayMethod.default;

    makeObservable(this, {
      wallet: observable,
      amount: observable,
      recipient: observable,
      network: observable,
      loadingState: observable,
      payingWallet: observable,
      feeInfo: observable,
      relayMethod: observable,

      // currencyMode: observable,

      getSelectedWallet: computed,

      selectRecipient: action,

      openConfirmModal: action,
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
    this.addReaction(
      reaction(
        () => ({
          payingWallet: this.payingWallet,
          recipient: this.recipient,
          network: this.network,
          wallet: this.getSelectedWallet,
        }),
        ({ payingWallet, recipient, network, wallet }) => {
          if (wallet) {
            this.feeInfo.request = this._sendService
              .getFees({
                wallet,
                receiver: recipient?.address,
                network,
                payingTokenMint: payingWallet?.mintAddress,
              })
              .then((_feeAmountInSol) => {
                // if fee is nil, no need to check for available wallets to pay fee
                const feeAmountInSOL = _feeAmountInSol ?? FeeAmount.zero();

                if (feeAmountInSOL.total.eq(ZERO)) {
                  return {
                    feeAmount: FeeAmount.zero(),
                    feeAmountInSOL: FeeAmount.zero(),
                    hasAvailableWalletToPayFee: true,
                  };
                }

                // else, check available wallets to pay fee
                const payingFeeWallet = payingWallet;
                if (!payingFeeWallet) {
                  return {
                    feeAmount: FeeAmount.zero(),
                    feeAmountInSOL: FeeAmount.zero(),
                    hasAvailableWalletToPayFee: false,
                  };
                }

                return Promise.all([
                  this._sendService.getAvailableWalletsToPayFee({ feeInSOL: feeAmountInSOL }),
                  this._sendService.getFeesInPayingToken({
                    feeInSOL: feeAmountInSOL,
                    payingFeeWallet,
                  }),
                ]).then(([wallets, feeAmount]) => {
                  return {
                    feeAmount: feeAmount ?? FeeAmount.zero(),
                    feeAmountInSOL,
                    hasAvailableWalletToPayFee: wallets.length !== 0,
                  };
                });
              });
          } else {
            this.feeInfo.request = Promise.resolve({
              feeAmount: FeeAmount.zero(),
              feeAmountInSOL: FeeAmount.zero(),
              hasAvailableWalletToPayFee: false,
            });
          }
          this.feeInfo.reload();
        },
      ),
    );
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
    let amount = this.amount;
    const recipient = this.recipient;
    if (!wallet || !amount || !recipient) {
      return;
    }

    // modify amount if using source wallet as paying wallet
    const totalFee = this.feeInfo.value?.feeAmount;
    if (totalFee && totalFee.total.gtn(0) && this.payingWallet?.pubkey === wallet.pubkey) {
      const feeAmount = convertToBalance(totalFee.total, this.payingWallet?.token.decimals);
      if (amount + feeAmount > wallet.amount.asNumber) {
        amount -= feeAmount;
      }
    }

    const network = this.network;

    /// TODO: processTransaction
  }

  // SendTokenChooseRecipientAndNetworkViewModelType

  get getSelectedWallet(): Wallet | null {
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

  chooseWallet(wallet: Wallet): void {
    this.wallet = wallet;

    if (!wallet.token.isRenBTC && this.network === Network.bitcoin) {
      this.selectNetwork(Network.solana);
    }
  }

  authenticateAndSend(): void {
    // TODO: authenticationHandler
    this._send();
  }

  ///

  enterAmount(amount: number) {
    this.amount = amount;
  }

  // SendTokenRecipientAndNetworkHandler

  selectRecipient(recipient: Recipient | null = null): void {
    this.recipient = recipient;

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

  selectPayingWallet(payingWallet: Wallet): void {
    Defaults.payingTokenMint = payingWallet.mintAddress;
    this.payingWallet = payingWallet;
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

  // our code

  openConfirmModal(viewModel: Readonly<SendViewModel>): Promise<void> {
    return this._modalService.openModal(ModalType.SHOW_MODAL_CONFIRM_SEND, { viewModel });
  }

  get error(): ChooseTokenAndAmountError | SelectAddressError | null {
    return this.chooseTokenAndAmountViewModel.error || this.selectAddressViewModel.error;
  }
}
