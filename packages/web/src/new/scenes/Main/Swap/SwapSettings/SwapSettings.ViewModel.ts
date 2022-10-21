import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { delay, inject, singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { WalletsRepository } from 'new/services/Repositories';

import { SwapViewModel } from '../Swap/Swap.ViewModel';
import { SlippageType, SlippageTypeType } from './model/SwapSettings.SlippageType';

export interface FeeCellContent {
  wallet?: Wallet;
  tokenLabelText: string;
  isSelected: boolean;
  onClick: () => void;
}

interface SwapSettingsViewModelType {
  readonly possibleSlippageTypes: SlippageType[];
  readonly slippageType: SlippageType;
  readonly feesContent: FeeCellContent[];
  readonly customSlippageIsOpened: boolean;

  slippageSelected(selected: SlippageType): void;
  customSlippageChanged(value: number | null): void;
}

// @web: injectable because use inject in constructor
@singleton()
export class SwapSettingsViewModel extends ViewModel implements SwapSettingsViewModelType {
  readonly possibleSlippageTypes: SlippageType[] = SlippageType.allCases;
  slippageType: SlippageType;
  customSlippageIsOpened: boolean;
  payingWallet: Wallet | null; // @web: references to swapViewModel

  get feesContent(): FeeCellContent[] {
    const feePayingToken = this.payingWallet;

    const list: FeeCellContent[] = [];
    const wallets = this._walletsRepository.getWallets().filter((_wallet) => _wallet.amount > 0);
    for (const wallet of wallets) {
      list.push({
        wallet,
        tokenLabelText: wallet.token.symbol,
        isSelected: feePayingToken?.mintAddress === wallet.mintAddress,
        onClick: () => {
          this._swapViewModel.changeFeePayingToken(wallet);
        },
      });
    }

    return list;
  }

  constructor(
    private _walletsRepository: WalletsRepository, // private _notificationService: NotificationService,
    @inject(delay(() => SwapViewModel)) public _swapViewModel: Readonly<SwapViewModel>,
  ) {
    super();

    this.slippageType = SlippageType.new(this._swapViewModel.slippage);
    this.customSlippageIsOpened = false;
    this.payingWallet = this._swapViewModel.payingWallet;

    makeObservable(this, {
      slippageType: observable,
      customSlippageIsOpened: observable,
      payingWallet: observable, // @web: references to swapViewModel

      feesContent: computed,

      slippageSelected: action,
      customSlippageChanged: action,
    });
  }

  protected override setDefaults(): void {
    this.slippageType = SlippageType.new(this._swapViewModel.slippage);
    this.customSlippageIsOpened = false;
    this.payingWallet = this._swapViewModel.payingWallet;
  }

  protected override onInitialize(): void {
    this._setCustomSlippageIsOpened(this.slippageType);

    this._bind();
  }

  protected override afterReactionsRemoved(): void {}

  private _bind() {
    this.addReaction(
      reaction(
        () => this._swapViewModel.slippage,
        (slippage) => {
          this.slippageType = SlippageType.new(slippage);
        },
      ),
    );

    this.addReaction(
      reaction(
        () => this._swapViewModel.payingWallet,
        (payingWallet) => {
          this.payingWallet = payingWallet;
        },
      ),
    );
  }

  // Actions

  slippageSelected(selected: SlippageType): void {
    this._setCustomSlippageIsOpened(selected);

    const slippage = selected.value;
    if (!slippage) {
      return;
    }

    this._swapViewModel.setSlippage(slippage);
    // TODO: notificationService.showInAppNotification(.done(L10n.thePriceSlippageWasSetAt(selected.description)))
  }

  customSlippageChanged(value: number | null): void {
    const valueNew = SlippageType.custom(value).value;
    if (this.customSlippageIsOpened) {
      if (valueNew) {
        this._swapViewModel.setSlippage(valueNew);
      } else {
        // @web: added for hide during "blur" Custom field
        this.customSlippageIsOpened = false;
      }
    }
  }

  private _setCustomSlippageIsOpened(slippageType: SlippageType): void {
    switch (slippageType.type) {
      case SlippageTypeType.oneTenth:
      case SlippageTypeType.fiveTenth:
      case SlippageTypeType.one:
      case SlippageTypeType.five:
        this.customSlippageIsOpened = false;
        break;
      case SlippageTypeType.custom:
        this.customSlippageIsOpened = true;
        break;
    }
  }
}
