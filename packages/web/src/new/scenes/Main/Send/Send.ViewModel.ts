import { ZERO } from '@orca-so/sdk';
import { action, computed, makeObservable, observable, reaction, runInAction, when } from 'mobx';
import { delay, inject, Lifecycle, scoped } from 'tsyringe';

import { LoadableRelay, LoadableState } from 'new/app/models/LoadableRelay';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { ChooseWalletViewModel } from 'new/scenes/Main/Send/ChooseWallet/ChooseWallet.ViewModel';
import type { SelectAddressError } from 'new/scenes/Main/Send/SelectAddress/SelectAddress.ViewModel';
import { SelectAddressViewModel } from 'new/scenes/Main/Send/SelectAddress/SelectAddress.ViewModel';
import type * as FeeRelayer from 'new/sdk/FeeRelayer';
import type * as SolanaSDK from 'new/sdk/SolanaSDK';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { convertToBalance, FeeAmount, toLamport } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { ModalService, ModalType } from 'new/services/ModalService';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { WalletsRepository } from 'new/services/Repositories';
import { RelayMethod, SendService } from 'new/services/SendService';
import type { ConfirmSendModalProps } from 'new/ui/modals/confirmModals/ConfirmSendModal/ConfirmSendModal';
import * as ProcessTransaction from 'new/ui/modals/ProcessTransactionModal/ProcessTransaction.Models';
import type { ProcessTransactionModalProps } from 'new/ui/modals/ProcessTransactionModal/ProcessTransactionModal';
import { numberToString } from 'new/utils/NumberExtensions';
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
  relayMethod: RelayMethod;

  // SendTokenChooseRecipientAndNetworkViewModelType
  get getSelectedWallet(): Wallet | null;
  getPrice(symbol: string): number;
  getPrices(symbols: string[]): Record<string, number>;
  get getFeeInCurrentFiat(): string;
  getFreeTransactionFeeLimit(): Promise<FeeRelayer.Relay.FreeTransactionFeeLimit>;

  chooseWallet(wallet: Wallet): void;

  readonly wallet: Wallet | null;
  readonly amount: number;
  readonly recipient: Recipient | null;
  // SendTokenRecipientAndNetworkHandler
  readonly network: Network;
  readonly loadingState: LoadableState;
  readonly payingWallet: Wallet | null;
  readonly feeInfo: LoadableRelay<FeeInfo>;
  selectRecipient(recipient: Recipient | null): void;
  selectNetwork(network: Network): void;

  chooseTokenAndAmountViewModel: ChooseTokenAndAmountViewModel;
}

@scoped(Lifecycle.ResolutionScoped)
export class SendViewModel extends ViewModel implements SendViewModelType {
  // Subject

  wallet: Wallet | null;
  amount: number;
  recipient: Recipient | null;
  network: Network;
  loadingState: LoadableState;
  payingWallet: Wallet | null;
  feeInfo: LoadableRelay<FeeInfo>;
  relayMethod: RelayMethod;

  // ChooseTokenAndAmount
  // currencyMode: CurrencyMode = CurrencyMode.token;

  private _walletsLoadPromise: (Promise<void> & { cancel(): void }) | null;

  constructor(
    private _pricesService: PricesService,
    private _walletsRepository: WalletsRepository,
    private _sendService: SendService,
    public chooseTokenAndAmountViewModel: ChooseTokenAndAmountViewModel,
    public choosePayingWalletViewModel: ChooseWalletViewModel,
    @inject(delay(() => SelectAddressViewModel))
    public selectAddressViewModel: Readonly<SelectAddressViewModel>,
    private _modalService: ModalService,
  ) {
    super();

    // TODO: relayMethod in constructor
    this.relayMethod = RelayMethod.default;

    this.wallet = null;
    this.amount = 0;
    this.recipient = null;
    this.network = Network.solana;
    this.loadingState = LoadableState.notRequested;
    this.payingWallet = null;
    this.feeInfo = new LoadableRelay<FeeInfo>(
      Promise.resolve({
        feeAmount: FeeAmount.zero(),
        feeAmountInSOL: FeeAmount.zero(),
        hasAvailableWalletToPayFee: false,
      }),
    );
    this._walletsLoadPromise = null;

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

      getFeeInCurrentFiat: computed,

      chooseWallet: action,
      enterAmount: action,

      selectRecipient: action,
      selectNetwork: action,
      selectPayingWallet: action,

      openConfirmModal: action,
    });
  }

  protected override setDefaults() {
    this.relayMethod = RelayMethod.default;

    this.wallet = null;
    this.amount = 0;
    this.recipient = null;
    this.network = Network.solana;
    this.loadingState = LoadableState.notRequested;
    this.payingWallet = null;
    this.feeInfo = new LoadableRelay<FeeInfo>(
      Promise.resolve({
        feeAmount: FeeAmount.zero(),
        feeAmountInSOL: FeeAmount.zero(),
        hasAvailableWalletToPayFee: false,
      }),
    );
    this._walletsLoadPromise = null;
  }

  protected override onInitialize() {
    this.chooseTokenAndAmountViewModel.initialize();
    this.selectAddressViewModel.initialize();
    this.choosePayingWalletViewModel.initialize();

    this._bind();
    this.reload();
  }

  protected override afterReactionsRemoved() {
    this.chooseTokenAndAmountViewModel.end();
    this.selectAddressViewModel.end();
    this.choosePayingWalletViewModel.end();

    if (this._walletsLoadPromise) {
      this._walletsLoadPromise.cancel();
    }
  }

  private _bind(): void {
    // Smart select fee token
    this.addReaction(
      reaction(
        () => this.recipient,
        (receiver) => {
          (async () => {
            const wallet = this.wallet;
            if (!wallet || !receiver) {
              return FeeAmount.zero();
            }

            return this._sendService
              .getFees({
                wallet,
                receiver: receiver.address,
                network: this.network,
                payingTokenMint: wallet.mintAddress,
              })
              .then((fee) => {
                if (!fee) {
                  return FeeAmount.zero();
                }

                return this._sendService.getFeesInPayingToken({
                  feeInSOL: fee,
                  payingFeeWallet: wallet,
                });
              });
          })()
            .then((fee) => {
              const amount = this.amount;
              const wallet = this.wallet;
              if (!amount || !wallet || !fee) {
                return;
              }

              if (
                toLamport(amount, wallet.token.decimals)
                  .add(fee.total)
                  .gt(wallet.lamports ?? ZERO)
              ) {
                runInAction(() => {
                  this.payingWallet = this._walletsRepository.nativeWallet;
                });
              } else {
                runInAction(() => {
                  this.payingWallet = wallet;
                });
              }
            })
            .catch((error) => console.error(error));
        },
      ),
    );

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
              .then(async (_feeAmountInSol) => {
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

                let availableWallets: SolanaSDK.Wallet[] = [];
                let feeInSPL: SolanaSDK.FeeAmount | null = null;
                try {
                  [availableWallets, feeInSPL] = await Promise.all([
                    this._sendService.getAvailableWalletsToPayFee({ feeInSOL: feeAmountInSOL }),
                    this._sendService.getFeesInPayingToken({
                      feeInSOL: feeAmountInSOL,
                      payingFeeWallet,
                    }),
                  ]);

                  return {
                    feeAmount: feeInSPL ?? FeeAmount.zero(),
                    feeAmountInSOL,
                    hasAvailableWalletToPayFee: availableWallets.length !== 0,
                  };
                } catch (error) {
                  console.error(error);
                  return {
                    feeAmount: FeeAmount.zero(),
                    feeAmountInSOL,
                    hasAvailableWalletToPayFee: availableWallets.length !== 0,
                  };
                }
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
        console.error(error);
        runInAction(() => {
          this.loadingState = LoadableState.error(error);
        });
      });
  }

  private _send() {
    const wallet = this.wallet;
    let amount = this.amount;
    const receiver = this.recipient;
    if (!wallet || !amount || !receiver) {
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

    void this._modalService.openModal<void, ProcessTransactionModalProps>(
      ModalType.SHOW_MODAL_PROCESS_TRANSACTION,
      {
        transaction: new ProcessTransaction.SendTransaction({
          sendService: this._sendService,
          network: network,
          sender: wallet,
          receiver: receiver,
          authority: this._walletsRepository.nativeWallet?.pubkey ?? null,
          amount: toLamport(amount, wallet.token.decimals),
          payingFeeWallet: this.payingWallet,
          feeInSOL: this.feeInfo.value?.feeAmountInSOL.total ?? ZERO,
          feeInToken: this.feeInfo.value?.feeAmount ?? null,
          isSimulation: false,
        }),
      },
    );
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

  get getFeeInCurrentFiat(): string {
    let fee = 0;
    const feeInfo = this.feeInfo.value;
    if (feeInfo) {
      const feeInSol = convertToBalance(feeInfo.feeAmountInSOL.total, 9);
      fee = feeInSol * this.getPrice('SOL');
    }
    return `~${Defaults.fiat.symbol}${numberToString(fee, { maximumFractionDigits: 2 })}`;
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

  openConfirmModal(): Promise<void> {
    return this._modalService.openModal<void, ConfirmSendModalProps>(
      ModalType.SHOW_MODAL_CONFIRM_SEND,
      {
        viewModel: this,
      },
    );
  }

  get error(): ChooseTokenAndAmountError | SelectAddressError | null {
    return this.chooseTokenAndAmountViewModel.error || this.selectAddressViewModel.error;
  }
}
