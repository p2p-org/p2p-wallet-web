import { ZERO } from '@orca-so/sdk';
import { action, makeObservable, observable } from 'mobx';
import { delay, inject, injectable } from 'tsyringe';

import { LoadableStateType } from 'new/app/models/LoadableRelay';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { RecipientsListViewModel } from 'new/scenes/Main/Send/SelectAddress/Subviews/RecipientsCollectionView';
import { convertToBalance } from 'new/sdk/SolanaSDK';
import { RelayMethodType } from 'new/services/SendService';
import { numberToString } from 'new/utils/NumberExtensions';

import type { Recipient } from '../Send.ViewModel';
import { Network, SendViewModel } from '../Send.ViewModel';

export enum SelectAddressErrorType {
  chooseTheRecipientToProceed = 'chooseTheRecipientToProceed',
  chooseTheTokenToPayFees = 'chooseTheTokenToPayFees',
  calculatingFees = 'calculatingFees',
  pleaseChooseAnotherOne = 'pleaseChooseAnotherOne',
  insufficientFundsToCoverFees = 'insufficientFundsToCoverFees',
  yourAccountDoesNotHaveEnoughToCoverFeesNeedsAtLeast = 'yourAccountDoesNotHaveEnoughToCoverFeesNeedsAtLeast',
  yourAccountDoesNotHaveEnoughToCoverFees = 'yourAccountDoesNotHaveEnoughToCoverFees',
}

type SelectAddressErrorTypeDataType = Partial<{
  symbol: string;
  neededAmount: string;
}>;

export class SelectAddressError {
  readonly type: SelectAddressErrorType;
  readonly data: SelectAddressErrorTypeDataType;

  static get chooseTheRecipientToProceed(): SelectAddressError {
    return new SelectAddressError(SelectAddressErrorType.chooseTheRecipientToProceed);
  }
  static get chooseTheTokenToPayFees(): SelectAddressError {
    return new SelectAddressError(SelectAddressErrorType.chooseTheTokenToPayFees);
  }
  static get calculatingFees(): SelectAddressError {
    return new SelectAddressError(SelectAddressErrorType.calculatingFees);
  }
  static get pleaseChooseAnotherOne(): SelectAddressError {
    return new SelectAddressError(SelectAddressErrorType.pleaseChooseAnotherOne);
  }
  static get insufficientFundsToCoverFees(): SelectAddressError {
    return new SelectAddressError(SelectAddressErrorType.insufficientFundsToCoverFees);
  }
  static yourAccountDoesNotHaveEnoughToCoverFeesNeedsAtLeast(
    data: SelectAddressErrorTypeDataType,
  ): SelectAddressError {
    return new SelectAddressError(
      SelectAddressErrorType.yourAccountDoesNotHaveEnoughToCoverFeesNeedsAtLeast,
      data,
    );
  }
  static yourAccountDoesNotHaveEnoughToCoverFees(
    data: SelectAddressErrorTypeDataType,
  ): SelectAddressError {
    return new SelectAddressError(
      SelectAddressErrorType.yourAccountDoesNotHaveEnoughToCoverFees,
      data,
    );
  }

  constructor(type: SelectAddressErrorType, data: SelectAddressErrorTypeDataType = {}) {
    this.type = type;
    this.data = data;
  }

  get buttonSuggestion(): string {
    switch (this.type) {
      case SelectAddressErrorType.chooseTheRecipientToProceed:
        return 'Choose the recipient to proceed';
      case SelectAddressErrorType.chooseTheTokenToPayFees:
        return 'Choose the token to pay fees';
      case SelectAddressErrorType.calculatingFees:
        return 'Calculating fees';
      case SelectAddressErrorType.pleaseChooseAnotherOne:
        return 'Paying token is not valid. Please choose another one';
      case SelectAddressErrorType.insufficientFundsToCoverFees:
        return 'Insufficient funds to cover fees';
      case SelectAddressErrorType.yourAccountDoesNotHaveEnoughToCoverFeesNeedsAtLeast:
        return `Your account does not have enough ${this.data.symbol} to cover fees. Needs at least ${this.data.neededAmount} ${this.data.symbol}`;
      case SelectAddressErrorType.yourAccountDoesNotHaveEnoughToCoverFees:
        return `Your account does not have enough ${this.data.symbol} to cover fees`;
    }
  }
}

export enum InputState {
  searching = 'searching',
  recipientSelected = 'recipientSelected',
}

export interface SelectAddressViewModelType {
  // SendTokenChooseRecipientAndNetworkSelectAddressViewModelType
  readonly preSelectedNetwork: Network | null;
  readonly inputState: string | null;
  readonly searchText: string | null;

  search(address?: string): void;
  selectRecipient(recipient: Recipient | null): void;
  clearRecipient(): void;
}

@injectable()
export class SelectAddressViewModel extends ViewModel implements SelectAddressViewModelType {
  // SendTokenChooseRecipientAndNetworkSelectAddressViewModelType
  preSelectedNetwork: Network | null = null;
  inputState: InputState = InputState.searching;
  searchText: string | null = null;

  constructor(
    public recipientsListViewModel: RecipientsListViewModel,
    @inject(delay(() => SendViewModel)) public sendViewModel: Readonly<SendViewModel>,
  ) {
    super();

    makeObservable(this, {
      inputState: observable,
      searchText: observable,

      search: action,
      selectRecipient: action,
      clearRecipient: action,
    });
  }

  protected override onInitialize() {
    this.recipientsListViewModel.initialize();
  }

  protected override afterReactionsRemoved() {
    this.recipientsListViewModel.end();
  }

  // SendTokenChooseRecipientAndNetworkSelectAddressViewModelType
  search(address = ''): void {
    this.searchText = address;
    if (this.recipientsListViewModel.searchString !== address) {
      this.recipientsListViewModel.searchString = address;
      this.recipientsListViewModel.reload();
    }
  }

  selectRecipient(recipient: Recipient | null = null) {
    this.sendViewModel.selectRecipient(recipient);
    this.inputState = InputState.recipientSelected;
  }

  clearRecipient() {
    this.inputState = InputState.searching;
    this.sendViewModel.selectRecipient(null);
  }

  clearSearching() {
    this.search('');
  }

  // our code

  get error() {
    const sourceWallet = this.sendViewModel.wallet;
    const recipient = this.sendViewModel.recipient;
    const payingWallet = this.sendViewModel.payingWallet;
    const feeInfo = this.sendViewModel.feeInfo;
    const network = this.sendViewModel.network;

    if (recipient === null) {
      return SelectAddressError.chooseTheRecipientToProceed;
    }

    switch (network) {
      case Network.solana:
        switch (this.sendViewModel.relayMethod.type) {
          case RelayMethodType.relay: {
            switch (feeInfo.state.type) {
              case LoadableStateType.notRequested:
                return SelectAddressError.chooseTheTokenToPayFees;
              case LoadableStateType.loading:
                return SelectAddressError.calculatingFees;
              case LoadableStateType.loaded: {
                const value = feeInfo.value;
                if (!value) {
                  return SelectAddressError.pleaseChooseAnotherOne;
                }

                if (!value.hasAvailableWalletToPayFee) {
                  return SelectAddressError.insufficientFundsToCoverFees;
                }

                if (value.feeAmount.total.gt(ZERO) && payingWallet && payingWallet.lamports) {
                  if (payingWallet.lamports.lt(value.feeAmount.total)) {
                    const neededAmount = numberToString(
                      convertToBalance(value.feeAmount.total, payingWallet.token.decimals),
                      { maximumFractionDigits: payingWallet.token.decimals },
                    );

                    return SelectAddressError.yourAccountDoesNotHaveEnoughToCoverFeesNeedsAtLeast({
                      symbol: payingWallet.token.symbol,
                      neededAmount,
                    });
                  }

                  if (
                    payingWallet.lamports.eq(value.feeAmount.total) &&
                    sourceWallet?.pubkey === payingWallet.pubkey
                  ) {
                    return SelectAddressError.yourAccountDoesNotHaveEnoughToCoverFees({
                      symbol: payingWallet.token.symbol,
                    });
                  }
                }

                if (value.feeAmount.total.eq(ZERO) && value.feeAmountInSOL.total.gt(ZERO)) {
                  return SelectAddressError.pleaseChooseAnotherOne;
                }
                break;
              }
              case LoadableStateType.error:
                return SelectAddressError.pleaseChooseAnotherOne;
            }
          }
        }
        break;
      case Network.bitcoin:
        break;
    }

    return null;
  }
}
