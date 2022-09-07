import { action, makeObservable, observable, reaction, when } from 'mobx';
import { singleton } from 'tsyringe';

import { LoadableRelay, LoadableState, LoadableStateType } from 'new/app/models/LoadableRelay';
import type { PayingFee } from 'new/app/models/PayingFee';
import { networkFees } from 'new/app/models/PayingFee';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { PoolsPair } from 'new/sdk/OrcaSwap';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { convertToBalance } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { WalletsRepository } from 'new/services/Repositories';
import { SwapService } from 'new/services/Swap';
import { ChooseWalletViewModel } from 'new/ui/components/common/ChooseWallet/ChooseWallet.ViewModel';

interface SwapViewModelType {
  sourceWallet: Wallet | null;
  destinationWallet: Wallet | null;
  inputAmount: number | null;
  estimatedAmount: number | null;

  reload(): void;
  swapSourceAndDestination(): void;
  useAllBalance(): void;
  enterInputAmount(amount: number | null): void;
  enterEstimatedAmount(amount: number | null): void;
  walletDidSelect(wallet: Wallet, isSelectingSourceWallet: boolean): void;
}

@singleton()
export class SwapViewModel extends ViewModel implements SwapViewModelType {
  loadingState: LoadableState;
  sourceWallet: Wallet | null;
  destinationWallet: Wallet | null;
  bestPoolsPair: PoolsPair | null;
  availableAmount: number | null;
  inputAmount: number | null;
  estimatedAmount: number | null;
  fees: LoadableRelay<PayingFee[]>;
  slippage: number;
  payingWallet: Wallet | null;
  isUsingAllBalance: boolean;

  constructor(
    public swapService: SwapService,
    public chooseSourceWalletViewModel: ChooseWalletViewModel,
    public chooseDestinationWalletViewModel: ChooseWalletViewModel,
    private _walletsRepository: WalletsRepository,
  ) {
    super();

    this.loadingState = LoadableState.notRequested;
    this.sourceWallet = null;
    this.destinationWallet = null;
    this.bestPoolsPair = null;
    this.availableAmount = null;
    this.inputAmount = null;
    this.estimatedAmount = null;
    this.fees = new LoadableRelay<PayingFee[]>(Promise.resolve([]));
    this.slippage = Defaults.slippage; // TODO: check maybe computed
    this.payingWallet = null;
    this.isUsingAllBalance = false;

    makeObservable(this, {
      loadingState: observable,
      sourceWallet: observable,
      destinationWallet: observable,
      bestPoolsPair: observable,
      availableAmount: observable,
      inputAmount: observable,
      estimatedAmount: observable,
      fees: observable,
      slippage: observable,
      payingWallet: observable,
      isUsingAllBalance: observable,

      swapSourceAndDestination: action,
      useAllBalance: action,
      enterInputAmount: action,
      enterEstimatedAmount: action,
      walletDidSelect: action,
    });
  }

  protected override setDefaults(): void {
    this.loadingState = LoadableState.notRequested;
    this.sourceWallet = null;
    this.destinationWallet = null;
    this.bestPoolsPair = null;
    this.availableAmount = null;
    this.inputAmount = null;
    this.estimatedAmount = null;
    this.fees = new LoadableRelay<PayingFee[]>(Promise.resolve([]));
    this.slippage = Defaults.slippage;
    this.payingWallet = null;
    this.isUsingAllBalance = false;
  }

  protected override onInitialize(): void {
    this.chooseSourceWalletViewModel.initialize();
    this.chooseDestinationWalletViewModel.initialize();

    this.addReaction(
      when(
        () => this._walletsRepository.state === SDFetcherState.loaded, // TODO: really wait until wallets load?
        () => {
          this.payingWallet = this._walletsRepository.nativeWallet;
          this.reload();
          this._bind(/* TODO: initialWallet ?? */ this._walletsRepository.nativeWallet);
        },
      ),
    );
  }

  protected override afterReactionsRemoved(): void {
    this.chooseSourceWalletViewModel.end();
    this.chooseDestinationWalletViewModel.end();
  }

  private _bind(initialWallet: Wallet | null): void {
    // wait until loaded and choose initial wallet
    if (initialWallet) {
      this.addReaction(
        when(
          () => this.loadingState.type === LoadableStateType.loaded,
          () => {
            this.sourceWallet = initialWallet;
          },
        ),
      );
    }

    // update wallet after swapping
    // TODO: code

    // available amount
    this.addReaction(
      reaction(
        () => ({
          sourceWallet: this.sourceWallet,
          payingWallet: this.payingWallet,
          fees: this.fees.value,
        }),
        ({ sourceWallet, payingWallet, fees }) => {
          this.availableAmount = calculateAvailableAmount({
            sourceWallet,
            payingFeeWallet: payingWallet,
            fees,
          });
        },
      ),
    );

    // auto fill balance after tapping max
    // TODO: code

    // get tradable pools pair for each token pair
    // TODO: code

    // Fill input amount and estimated amount after loaded
    // TODO: code

    // fees
    this.addReaction(
      reaction(
        () => ({
          bestPoolsPair: this.bestPoolsPair,
          inputAmount: this.inputAmount,
          slippage: this.slippage,
          destinationWallet: this.destinationWallet,
          sourceWallet: this.sourceWallet,
          payingWallet: this.payingWallet,
        }),
        () => {
          this.fees.request = this._feesRequest();
          this.fees.reload();
        },
      ),
    );

    // Smart selection fee token paying

    // Input wallet was changed
    // TODO: code

    // Input amount was changed
    // TODO: code

    // Error
    // TODO: code
  }

  // Actions

  // TODO:
  authenticateAndSwap(): void {}

  // TODO:
  swap(): void {}

  reload(): void {
    this.loadingState = LoadableState.loading;

    this.swapService
      .load()
      .then(
        action(() => {
          this.loadingState = LoadableState.loaded;
        }),
      )
      .catch(
        action((error) => {
          this.loadingState = LoadableState.error(error.message); // TODO: readableDescription
        }),
      );
  }

  swapSourceAndDestination(): void {
    const source = this.sourceWallet;
    this.sourceWallet = this.destinationWallet;
    this.destinationWallet = source;
  }

  useAllBalance(): void {
    this.isUsingAllBalance = true;
    this.enterInputAmount(this.availableAmount);

    const fees = this.fees.value;
    if (fees && fees.length && this.availableAmount !== this.inputAmount) {
      // TODO:  notificationsService.showInAppNotification
      console.log('This value is calculated by subtracting the transaction fee from your balance.');
    }
  }

  // TODO:
  enterInputAmount(amount: number | null): void {
    this.inputAmount = amount;
  }

  // TODO:
  enterEstimatedAmount(amount: number | null): void {
    this.estimatedAmount = amount;
  }

  /**
   *
   * @param wallet
   * @param isSelectingSourceWallet indicate if selecting source wallet or destination wallet
   */
  walletDidSelect(wallet: Wallet, isSelectingSourceWallet: boolean): void {
    if (isSelectingSourceWallet) {
      this.sourceWallet = wallet;
    } else {
      this.destinationWallet = wallet;
    }
  }

  // OrcaSwapV2.Helper

  private async _feesRequest(): Promise<PayingFee[]> {
    const sourceWallet = this.sourceWallet;
    const destinationWallet = this.destinationWallet;
    if (!sourceWallet || !destinationWallet) {
      return [];
    }

    return (
      await this.swapService.getFees({
        sourceMint: sourceWallet.mintAddress,
        destinationAddress: destinationWallet.pubkey,
        destinationToken: destinationWallet.token,
        bestPoolsPair: this.bestPoolsPair,
        payingWallet: this.payingWallet,
        inputAmount: this.inputAmount,
        slippage: this.slippage,
      })
    ).fees;
  }
}

function calculateAvailableAmount({
  sourceWallet,
  payingFeeWallet,
  fees,
}: {
  sourceWallet?: Wallet | null;
  payingFeeWallet?: Wallet | null;
  fees?: PayingFee[] | null;
}): number | null {
  if (!sourceWallet) {
    return null;
  }

  // subtract the fee when source wallet is the paying wallet
  if (payingFeeWallet?.mintAddress === sourceWallet.mintAddress) {
    const _networkFeesU64 = fees ? networkFees(fees, sourceWallet.token.symbol)?.total : null;
    const _networkFees = _networkFeesU64
      ? convertToBalance(_networkFeesU64, sourceWallet.token.decimals)
      : null;

    const amount = sourceWallet.amount;
    if (_networkFees && amount) {
      if (amount > _networkFees) {
        return amount - _networkFees;
      } else {
        return 0;
      }
    }
  }

  return sourceWallet.amount;
}
