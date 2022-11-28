import { flow, reaction } from 'mobx';
import { delay, inject, injectable } from 'tsyringe';

import { SDListViewModel } from 'new/core/viewmodels/SDListViewModel';
import type { Network, Recipient } from 'new/scenes/Main/Send';
import { SendViewModel } from 'new/scenes/Main/Send';
import { NameService } from 'new/services/NameService';
import { SendService } from 'new/services/SendService';
import { bitcoinAddress, matches, publickey } from 'new/utils/RegularExpression';

@injectable()
export class RecipientsListViewModel extends SDListViewModel<Recipient> {
  private _preSelectedNetwork: Network;

  // Properties
  searchString?: string;

  get isSearchingByAddress(): boolean {
    if (!this.searchString) {
      return false;
    }

    return matches(this.searchString, [
      bitcoinAddress(this._solanaAPIClient.isTestNet()),
      publickey(),
    ]);
  }

  constructor(
    private _nameService: NameService,
    private _solanaAPIClient: SendService,
    @inject(delay(() => SendViewModel))
    private _sendViewModel: Readonly<SendViewModel>,
  ) {
    super();

    this._preSelectedNetwork = this._sendViewModel.network;
  }

  protected override setDefaults() {
    this._preSelectedNetwork = this._sendViewModel.network;
  }

  protected override onInitialize() {
    this.addReaction(
      reaction(
        () => this._sendViewModel.network,
        (network) => {
          this._preSelectedNetwork = network;
        },
      ),
    );
  }

  protected override afterReactionsRemoved() {}

  // Methods

  override createRequest = flow<Recipient[], []>(function* (
    this: RecipientsListViewModel,
  ): Generator<Promise<Recipient[]>> {
    if (!this.searchString) {
      return yield Promise.resolve([]);
    }

    // force find by address when network is bitcoin
    return yield this.isSearchingByAddress
      ? this._findRecipientBy(this.searchString)
      : this._findRecipientsBy(this.searchString);
  });

  private _findRecipientsBy(name: string): Promise<Recipient[]> {
    return this._nameService.getOwners(name).then((owners) => {
      return owners.map(
        (owner) =>
          <Recipient>{
            address: owner.owner,
            name: owner.name,
            hasNoFunds: false,
          },
      );
    });
  }

  private _findRecipientBy(address: string): Promise<Recipient[]> {
    if (matches(address, [bitcoinAddress(this._solanaAPIClient.isTestNet())])) {
      return this._findAddressInBitcoinNetwork(address);
    }
    return this._findAddressInSolanaNetwork(address);
  }

  private _findAddressInBitcoinNetwork(address: string): Promise<Recipient[]> {
    if (matches(address, [bitcoinAddress(this._solanaAPIClient.isTestNet())])) {
      return Promise.resolve([
        {
          address,
          name: null,
          hasNoFunds: false,
        },
      ]);
    }
    return Promise.resolve([]);
  }

  private _findAddressInSolanaNetwork(address: string): Promise<Recipient[]> {
    return this._solanaAPIClient
      .checkAccountValidation(address)
      .catch(() => false)
      .then((result) => [
        <Recipient>{
          address,
          name: null,
          hasNoFunds: !result,
        },
      ]);
  }
}
