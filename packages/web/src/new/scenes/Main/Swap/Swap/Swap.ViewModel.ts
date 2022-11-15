import { ZERO } from '@orca-so/sdk';
import { action, computed, makeObservable, observable, reaction, when } from 'mobx';
import { delay, inject, singleton } from 'tsyringe';

import { LoadableRelay, LoadableState, LoadableStateType } from 'new/app/models/LoadableRelay';
import type { PayingFee } from 'new/app/models/PayingFee';
import { FeeType, FeeTypeEnum, networkFees, transactionFees } from 'new/app/models/PayingFee';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { ActiveInputField, VerificationError } from 'new/scenes/Main/Swap/Swap/types';
import { trackEvent } from 'new/sdk/Analytics';
import type { PoolsPair } from 'new/sdk/OrcaSwap';
import { getInputAmount, getMinimumAmountOut, getOutputAmount } from 'new/sdk/OrcaSwap';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { convertToBalance, toLamport } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { LocationService } from 'new/services/LocationService';
import { ModalService, ModalType } from 'new/services/ModalService';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { WalletsRepository } from 'new/services/Repositories';
import {
  findBestPoolsPairForEstimatedAmount,
  findBestPoolsPairForInputAmount,
  SwapService,
  totalDecimal,
  totalLamport,
  totalToken,
} from 'new/services/Swap';
import { ChooseWalletViewModel } from 'new/ui/components/common/ChooseWallet';
import type { ConfirmSwapModalProps } from 'new/ui/modals/confirmModals/ConfirmSwapModal';
import type { ProcessTransactionModalProps } from 'new/ui/modals/ProcessTransactionModal';
import * as ProcessTransaction from 'new/ui/modals/ProcessTransactionModal/ProcessTransaction.Models';
import { maxSlippage, rounded } from 'new/utils/NumberExtensions';

import { SwapSettingsViewModel } from '../SwapSettings/SwapSettings.ViewModel';

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

// for ability of resolve in SwapSettings.ViewModel
@singleton()
export class SwapViewModel extends ViewModel implements SwapViewModelType {
  isUsingAllBalance: boolean;

  loadingState: LoadableState;
  sourceWallet: Wallet | null;
  destinationWallet: Wallet | null;
  tradablePoolsPairs: LoadableRelay<PoolsPair[]>;
  bestPoolsPair: PoolsPair | null;
  availableAmount: number | null;
  inputAmount: number | null;
  estimatedAmount: number | null;
  fees: LoadableRelay<PayingFee[]>;
  slippage: number;
  payingWallet: Wallet | null;

  error: VerificationError | null;
  activeInputField: ActiveInputField;

  constructor(
    public swapService: SwapService,
    public chooseSourceWalletViewModel: ChooseWalletViewModel,
    public chooseDestinationWalletViewModel: ChooseWalletViewModel,
    @inject(delay(() => SwapSettingsViewModel)) public swapSettingsViewModel: SwapSettingsViewModel,
    private _walletsRepository: WalletsRepository,
    private _pricesService: PricesService,
    private _modalService: ModalService,
    private _locationService: LocationService,
  ) {
    super();

    this.isUsingAllBalance = false;

    this.loadingState = LoadableState.notRequested;
    this.sourceWallet = null;
    this.destinationWallet = null;
    this.tradablePoolsPairs = new LoadableRelay<PoolsPair[]>(Promise.resolve([]));
    this.bestPoolsPair = null;
    this.availableAmount = null;
    this.inputAmount = null;
    this.estimatedAmount = null;
    this.fees = new LoadableRelay<PayingFee[]>(Promise.resolve([]));
    this.slippage = Defaults.slippage; // TODO: check maybe computed
    this.payingWallet = null;

    this.error = null;
    this.activeInputField = ActiveInputField.none;

    makeObservable(this, {
      isUsingAllBalance: observable,

      loadingState: observable,
      sourceWallet: observable,
      destinationWallet: observable,
      tradablePoolsPairs: observable,
      bestPoolsPair: observable,
      availableAmount: observable,
      inputAmount: observable,
      estimatedAmount: observable,
      fees: observable,
      slippage: observable,
      payingWallet: observable,

      error: observable,
      activeInputField: observable,

      minimumReceiveAmount: computed,
      isSendingMaxAmount: computed,
      isShowingShowDetailsButton: computed,

      swapSourceAndDestination: action,
      useAllBalance: action,
      enterInputAmount: action,
      enterEstimatedAmount: action,
      walletDidSelect: action,
      changeFeePayingToken: action,

      setActiveInputField: action,
      setSlippage: action,

      totalFees: computed,
    });
  }

  protected override setDefaults(): void {
    this.isUsingAllBalance = false;

    this.loadingState = LoadableState.notRequested;
    this.sourceWallet = null;
    this.destinationWallet = null;
    this.tradablePoolsPairs = new LoadableRelay<PoolsPair[]>(Promise.resolve([]));
    this.bestPoolsPair = null;
    this.availableAmount = null;
    this.inputAmount = null;
    this.estimatedAmount = null;
    this.fees = new LoadableRelay<PayingFee[]>(Promise.resolve([]));
    this.slippage = Defaults.slippage;
    this.payingWallet = null;

    this.error = null;
    this.activeInputField = ActiveInputField.none;
  }

  protected override onInitialize(): void {
    this.chooseSourceWalletViewModel.initialize();
    this.chooseDestinationWalletViewModel.initialize();
    this.swapSettingsViewModel.initialize();

    // TODO: really wait until wallets load?
    this.addReaction(
      when(
        () => this._walletsRepository.state === SDFetcherState.loaded,
        () => {
          this.payingWallet = this._walletsRepository.nativeWallet;
          this.reload();

          const pubkey = this._getPubkey();
          const initialWallet = this._walletsRepository
            .getWallets()
            .find((wallet) => wallet.pubkey === pubkey);
          // redirect to swap if don't found wallet with pubkey from URL
          if (pubkey && !initialWallet) {
            this._locationService.push('/swap');
          }

          this._bind(initialWallet ?? this._walletsRepository.nativeWallet);
        },
      ),
    );
  }

  private _getPubkey(): string | undefined {
    return this._locationService.getParams<'publicKey'>('/swap/:publicKey?').publicKey;
  }

  protected override afterReactionsRemoved(): void {
    this.chooseSourceWalletViewModel.end();
    this.chooseDestinationWalletViewModel.end();
    this.swapSettingsViewModel.end();
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
    // TODO: check that is needed
    // this.addReaction(
    //   reaction(
    //     () => this._walletsRepository.data, // TODO: should skip(1)
    //     (wallets) => {
    //       if (this.sourceWallet?.pubkey) {
    //         const wallet = wallets.find((wallet) => wallet.pubkey === this.sourceWallet?.pubkey);
    //         if (wallet) {
    //           this.sourceWallet = wallet;
    //         }
    //
    //         if (this.destinationWallet?.pubkey) {
    //           const wallet = wallets.find(
    //             (wallet) => wallet.pubkey === this.destinationWallet?.pubkey,
    //           );
    //           if (wallet) {
    //             this.destinationWallet = wallet;
    //           }
    //         }
    //       }
    //     },
    //   ),
    // );

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
    this.addReaction(
      reaction(
        () => this.availableAmount,
        (availableAmount) => {
          const inputAmount = this.inputAmount;
          if (!this.isUsingAllBalance || !inputAmount || !availableAmount) {
            return false;
          }

          return (
            this.isUsingAllBalance &&
            rounded(inputAmount, this.sourceWallet?.token.decimals) >
              rounded(availableAmount, this.sourceWallet?.token.decimals)
          );
        },
      ),
    );

    // get tradable pools pair for each token pair
    this.addReaction(
      reaction(
        () => ({
          sourceWallet: this.sourceWallet,
          destinationWallet: this.destinationWallet,
        }),
        ({ sourceWallet, destinationWallet }) => {
          if (!sourceWallet || !destinationWallet) {
            this.tradablePoolsPairs.request = Promise.resolve([]);
            this.tradablePoolsPairs.reload();
            return;
          }

          this.tradablePoolsPairs.request = this.swapService.getPoolPair({
            sourceMint: sourceWallet.token.address,
            destinationMint: destinationWallet.token.address,
          });
          this.tradablePoolsPairs.reload();
        },
      ),
    );

    // Fill input amount and estimated amount after loaded
    this.addReaction(
      reaction(
        () => this.tradablePoolsPairs.state.type === LoadableStateType.loaded,
        () => {
          const inputAmount = this.inputAmount;
          const estimatedAmount = this.estimatedAmount;
          if (inputAmount && this.activeInputField !== ActiveInputField.destination) {
            this.enterInputAmount(inputAmount);
          } else if (estimatedAmount) {
            this.enterEstimatedAmount(estimatedAmount);
          }
        },
      ),
    );

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
    this.addReaction(
      reaction(
        () => this.sourceWallet,
        (wallet) => {
          if (!wallet) {
            return;
          }
          // @web: sync url with source wallet
          this._locationService.push(`/swap/${wallet.pubkey}`);

          this.payingWallet = wallet;
        },
      ),
    );

    // Input amount was changed
    this.addReaction(
      reaction(
        () => this.inputAmount,
        async (input) => {
          const availableAmount = this.availableAmount;
          if (!input || !availableAmount) {
            return;
          }
          const fees = await this._feesRequest();

          // If paying token fee equals input token
          if (
            this.payingWallet?.pubkey === this.sourceWallet?.pubkey &&
            !this.payingWallet?.isNativeSOL
          ) {
            // Selected wallet can not covert fee
            if (
              input + totalDecimal(fees) > availableAmount &&
              (this._walletsRepository.nativeWallet?.amount ?? 0) > 0
            ) {
              const solWallet = this._walletsRepository.nativeWallet;
              if (!solWallet) {
                return;
              }
              this.changeFeePayingToken(solWallet);
            }
          }
        },
      ),
    );

    // Error
    this.addReaction(
      reaction(
        () => ({
          loadingState: this.loadingState,
          sourceWallet: this.sourceWallet,
          destinationWallet: this.destinationWallet,
          tradablePoolsPairs: this.tradablePoolsPairs.state,
          bestPoolsPair: this.bestPoolsPair,
          fees: this.fees.value,
          payingWallet: this.payingWallet,
        }),
        () => {
          this.error = this._verify();
        },
      ),
    );
  }

  // Actions

  authenticateAndSwap(): void {
    // TODO: authenticationHandler
    this._swap();
  }

  private _swap(): void {
    if (this._verify()) {
      return;
    }

    const authority = this._walletsRepository.nativeWallet?.pubkey;
    const sourceWallet = this.sourceWallet!;
    const destinationWallet = this.destinationWallet!;
    const bestPoolsPair = this.bestPoolsPair!;
    const inputAmount = this.inputAmount!;
    const estimatedAmount = this.estimatedAmount!;
    const payingWallet = this.payingWallet;
    const slippage = this.slippage;
    const fees = this.fees.value?.filter((fee) => fee.type !== FeeType.liquidityProviderFee) ?? [];

    const swapMAX = this.availableAmount === inputAmount;

    // log
    const receiveAmount = this.minimumReceiveAmount ?? 0;
    const receivePricePair = destinationWallet.priceInCurrentFiat ?? 0.0;
    const swapUSD = receiveAmount * receivePricePair;

    // show processing scene
    void this._modalService.openModal<void, ProcessTransactionModalProps>(
      ModalType.SHOW_MODAL_PROCESS_TRANSACTION,
      {
        transaction: new ProcessTransaction.SwapTransaction({
          swapService: this.swapService,
          sourceWallet,
          destinationWallet,
          payingWallet,
          authority,
          poolsPair: bestPoolsPair,
          amount: inputAmount,
          estimatedAmount,
          slippage,
          fees,
          metaInfo: {
            swapMAX,
            swapUSD,
          },
        }),
      },
    );
  }

  get minimumReceiveAmount(): number | null {
    const poolsPair = this.bestPoolsPair;
    const _inputAmount = this.inputAmount;
    const slippage = this.slippage;
    const sourceWallet = this.sourceWallet;
    const destinationWallet = this.destinationWallet;

    const sourceDecimals = sourceWallet?.token.decimals;
    if (!_inputAmount || !sourceDecimals) {
      return null;
    }
    const inputAmount = toLamport(_inputAmount, sourceDecimals);
    const destinationDecimals = destinationWallet?.token.decimals;
    if (!poolsPair || !inputAmount || !destinationDecimals) {
      return null;
    }

    const minimumAmountOut = getMinimumAmountOut(poolsPair, inputAmount, slippage);
    if (!minimumAmountOut) {
      return null;
    }
    return convertToBalance(minimumAmountOut, destinationDecimals);
  }

  get exchangeRate(): number | null {
    const inputAmount = this.inputAmount;
    const estimatedAmount = this.estimatedAmount;
    if (inputAmount && estimatedAmount && inputAmount > 0 && estimatedAmount > 0) {
      return estimatedAmount / inputAmount;
    }
    return null;
  }

  get isSendingMaxAmount(): boolean {
    const availableAmount = this.availableAmount;
    const currentAmount = this.inputAmount;
    return availableAmount === currentAmount;
  }

  get isShowingShowDetailsButton(): boolean {
    return Boolean(this.sourceWallet) && Boolean(this.destinationWallet);
  }

  getPrice(symbol: string): number | null {
    return this._pricesService.currentPrice(symbol)?.value ?? null;
  }

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
      console.warn(
        'This value is calculated by subtracting the transaction fee from your balance.',
      );
    }
  }

  enterInputAmount(amount: number | null): void {
    const _amount = amount ? rounded(amount, this.sourceWallet?.token.decimals) : null;
    this.inputAmount = _amount;

    // calculate estimated amount
    const sourceDecimals = this.sourceWallet?.token.decimals;
    const destinationDecimals = this.destinationWallet?.token.decimals;
    const poolsPairs = this.tradablePoolsPairs.value;
    let inputAmount, bestPoolsPair, bestEstimatedAmountU64, bestEstimatedAmount;
    if (
      sourceDecimals &&
      destinationDecimals &&
      (inputAmount = _amount ? toLamport(_amount, sourceDecimals) : null) &&
      poolsPairs &&
      (bestPoolsPair = findBestPoolsPairForInputAmount({
        poolsPairs,
        inputAmount,
      })) &&
      (bestEstimatedAmountU64 = inputAmount ? getOutputAmount(bestPoolsPair, inputAmount) : null) &&
      (bestEstimatedAmount = bestEstimatedAmountU64
        ? rounded(
            convertToBalance(bestEstimatedAmountU64, destinationDecimals),
            destinationDecimals,
          )
        : null)
    ) {
      this.estimatedAmount = bestEstimatedAmount;
      this.bestPoolsPair = bestPoolsPair;
    } else {
      this.estimatedAmount = null;
      this.bestPoolsPair = null;
    }
  }

  enterEstimatedAmount(amount: number | null): void {
    const _amount = amount ? rounded(amount, this.destinationWallet?.token.decimals) : null;
    this.estimatedAmount = _amount;

    // calculate input amount
    const sourceDecimals = this.sourceWallet?.token.decimals;
    const destinationDecimals = this.destinationWallet?.token.decimals;
    const poolsPairs = this.tradablePoolsPairs.value;
    let estimatedAmount, bestPoolsPair, bestInputAmountU64, bestInputAmount;
    if (
      sourceDecimals &&
      destinationDecimals &&
      (estimatedAmount = _amount ? toLamport(_amount, destinationDecimals) : null) &&
      poolsPairs &&
      (bestPoolsPair = findBestPoolsPairForEstimatedAmount({
        poolsPairs,
        estimatedAmount,
      })) &&
      (bestInputAmountU64 = estimatedAmount
        ? getInputAmount(bestPoolsPair, estimatedAmount)
        : null) &&
      (bestInputAmount = rounded(
        convertToBalance(bestInputAmountU64, sourceDecimals),
        sourceDecimals,
      ))
    ) {
      this.inputAmount = bestInputAmount;
      this.bestPoolsPair = bestPoolsPair;
    } else {
      this.inputAmount = null;
      this.bestPoolsPair = null;
    }
  }

  /**
   *
   * @param wallet
   * @param isSelectingSourceWallet indicate if selecting source wallet or destination wallet
   */
  walletDidSelect(wallet: Wallet, isSelectingSourceWallet: boolean): void {
    if (isSelectingSourceWallet) {
      this.sourceWallet = wallet;

      // track TokenA changed
      trackEvent({ name: 'Swap_Changing_Token_A', params: { Token_A_Name: wallet.token.symbol } });
    } else {
      this.destinationWallet = wallet;

      // track TokenB changed
      trackEvent({ name: 'Swap_Changing_Token_B', params: { Token_B_Name: wallet.token.symbol } });
    }
  }

  changeFeePayingToken(payingToken: Wallet): void {
    this.payingWallet = payingToken;
  }

  setActiveInputField(value: ActiveInputField): void {
    this.activeInputField = value;
  }

  // OrcaSwapV2.Helper

  // Verify error in current context IN ORDER
  // - Returns: String or nil if no error
  private _verify(): VerificationError | null {
    // loading state
    if (this.loadingState.type !== LoadableStateType.loaded) {
      return VerificationError.swappingIsNotAvailable;
    }

    // source wallet
    const sourceWallet = this.sourceWallet;
    if (!sourceWallet) {
      return VerificationError.sourceWalletIsEmpty;
    }

    // destination wallet
    const destinationWallet = this.destinationWallet;
    if (!destinationWallet) {
      return VerificationError.destinationWalletIsEmpty;
    }

    // prevent swap the same token
    if (sourceWallet.token.address === destinationWallet.token.address) {
      return VerificationError.canNotSwapToItSelf;
    }

    // pools pairs
    if (this.tradablePoolsPairs.state.type !== LoadableStateType.loaded) {
      return VerificationError.tradablePoolsPairsNotLoaded;
    }

    if (!this.tradablePoolsPairs.value || this.tradablePoolsPairs.value.length === 0) {
      return VerificationError.tradingPairNotSupported;
    }

    // inputAmount
    const inputAmount = this.inputAmount;
    if (!inputAmount) {
      return VerificationError.inputAmountIsEmpty;
    }

    if (rounded(inputAmount, sourceWallet.token.decimals) <= 0) {
      return VerificationError.inputAmountIsNotValid;
    }

    // TODO: check "?? 0" right
    // TODO: need to do it early for error on "max amount"
    if (
      rounded(inputAmount, sourceWallet.token.decimals) >
      rounded(this.availableAmount ?? 0, sourceWallet.token.decimals)
    ) {
      return VerificationError.insufficientFunds;
    }

    // estimated amount
    const estimatedAmount = this.estimatedAmount;
    if (!estimatedAmount) {
      return VerificationError.estimatedAmountIsNotValid;
    }

    if (rounded(estimatedAmount, destinationWallet.token.decimals) <= 0) {
      return VerificationError.estimatedAmountIsNotValid;
    }

    // best pools pairs
    if (!this.bestPoolsPair) {
      return VerificationError.bestPoolsPairsIsEmpty;
    }

    // fees
    if (this.fees.state.isError) {
      return VerificationError.couldNotCalculatingFees;
    }

    if (this.fees.state.type !== LoadableStateType.loaded) {
      return VerificationError.feesIsBeingCalculated;
    }

    const payingWallet = this.payingWallet;
    if (!payingWallet) {
      return VerificationError.payingFeeWalletNotFound;
    }

    // paying with SOL
    if (payingWallet.isNativeSOL) {
      const wallet = this._walletsRepository.nativeWallet;
      if (!wallet) {
        return VerificationError.nativeWalletNotFound;
      }

      const feeInSOL = this.fees.value ? transactionFees(this.fees.value, 'SOL') : ZERO;

      if (feeInSOL.gt(wallet.lamports ?? ZERO)) {
        return VerificationError.notEnoughSOLToCoverFees;
      }
    }

    // paying with SPL token
    else {
      // TODO: - fee compensation
      //                if (!feeCompensationPool) {
      //                    return 'Fee compensation pool not found';
      //                }
      const feeTotal = this.fees.value ? totalLamport(this.fees.value) : null;
      if (feeTotal) {
        const feeTotalTokenSymbol = this.fees.value ? totalToken(this.fees.value)?.symbol : null;
        if (payingWallet.token.symbol === feeTotalTokenSymbol) {
          if (feeTotal.gt(payingWallet.lamports ?? ZERO)) {
            return VerificationError.notEnoughBalanceToCoverFees;
          }
        }
      }
    }

    // slippage
    if (!this._isSlippageValid()) {
      return VerificationError.slippageIsNotValid;
    }

    return null;
  }

  private _isSlippageValid(): boolean {
    return this.slippage <= maxSlippage && this.slippage > 0;
  }

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

  // own code

  openConfirmModal(): Promise<void> {
    return this._modalService.openModal<void, ConfirmSwapModalProps>(
      ModalType.SHOW_MODAL_CONFIRM_SWAP,
      {
        viewModel: this,
      },
    );
  }

  setSlippage(slippage: number): void {
    this.slippage = slippage;
  }

  get totalFees(): {
    totalFeesSymbol: string;
    decimals: number;
    amount: number;
    amountInFiat: number;
  } | null {
    const fees = this.fees.value ?? [];

    const totalFeesSymbol = fees.find((fee) => fee.type.type === FeeTypeEnum.transactionFee)?.token
      .symbol;
    if (totalFeesSymbol) {
      const totalFees = fees.filter(
        (fee) =>
          fee.token.symbol === totalFeesSymbol &&
          fee.type.type !== FeeTypeEnum.liquidityProviderFee,
      );
      const decimals = totalFees[0]?.token.decimals ?? 0;
      const amount = convertToBalance(
        totalFees.reduce((acc, curr) => acc.add(curr.lamports), ZERO),
        decimals,
      );
      const price = this.getPrice(totalFeesSymbol) ?? 0;
      const amountInFiat = amount * price;

      return {
        totalFeesSymbol,
        decimals,
        amount,
        amountInFiat,
      };
    }

    return null;
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
