import { action, makeObservable, observable } from 'mobx';
import { delay, inject, injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { RecipientsListViewModel } from 'new/scenes/Main/Send/SelectAddress/Subviews/RecipientsCollectionView/RecipientsList.ViewModel';

import type { Network, Recipient } from '../Send.ViewModel';
import { SendViewModel } from '../Send.ViewModel';

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
}
