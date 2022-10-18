import { singleton } from 'tsyringe';

import { SDFetcherState, SDStreamListViewModel } from 'new/core/viewmodels';
import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import { Defaults } from 'new/services/Defaults';
import DependencyService from 'new/services/injection/DependencyService';

import { SolanaTransactionRepository } from './History.Repository';
import { DefaultTransactionParser } from './History.TransactionParser';
import type { HistoryRefreshTrigger } from './RefreshTrigger';
import { PriceRefreshTrigger, ProcessingTransactionRefreshTrigger } from './RefreshTrigger';

type AccountSymbol = {
  account: string;
  symbol: string;
};

enum State {
  items = 'items',
  empty = 'empty',
  error = 'error',
}

@singleton()
export class HistoryViewModel extends SDStreamListViewModel<ParsedTransaction> {
  transactionRepository = new SolanaTransactionRepository();
  transactionParser = new DefaultTransactionParser({ p2pFeePayers: Defaults.p2pFeePayerPubkeys });

  // Properties

  /// Symbol to filter coins
  accountSymbol?: AccountSymbol;

  /// Refresh handling
  private _refreshTriggers: HistoryRefreshTrigger[] = [
    DependencyService.resolve(PriceRefreshTrigger),
    DependencyService.resolve(ProcessingTransactionRefreshTrigger),
  ];

  /// A list of source, where data can be fetched
  private _source: HistoryStreamSource = EmptyStreamSource();

  /// A list of output objects, that builds, forms, maps, filters and updates a final list.
  /// This list will be delivered to UI layer.
  private _outputs: HistoryOutput[];

  get stateDriver(): State {
    const change = this.dataObservable; // TODO: check, should be "withPrevious"
    const state = this.stateObservable;
    const error = this.error;
    if (error) {
      return State.error;
    }

    if (state === SDFetcherState.loading || state === SDFetcherState.initializing) {
      return State.items;
    } else {
      return (change?.length ?? 0) > 0 ? State.items : State.empty;
    }
  }

  // TODO: tryAgain
  // TODO: refreshPage
  // TODO: errorRelay

  constructor() {
    super({ isPaginationEnabled: true, limit: 10 });

    this._outputs = [
      new ProcessingTransactionsOutput(accountSymbol?.account),
      new PriceUpdatingOutput(),
    ];

    // Register all refresh triggers
    for (const trigger of this._refreshTriggers) {
      this.addReaction(trigger.register(() => this.refreshUI()));
    }
  }
}
