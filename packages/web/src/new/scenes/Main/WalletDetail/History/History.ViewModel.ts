import { flow, when } from 'mobx';
import { singleton } from 'tsyringe';

import { SDFetcherState, SDStreamListViewModel } from 'new/core/viewmodels';
import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import { Defaults } from 'new/services/Defaults';
import DependencyService from 'new/services/injection/DependencyService';
import { NotificationService } from 'new/services/NotificationService';
import { WalletsRepository } from 'new/services/Repositories';

import { SolanaTransactionRepository } from './History.Repository';
import { DefaultTransactionParser } from './History.TransactionParser';
import type { HistoryOutput } from './Output';
import { PriceUpdatingOutput, ProcessingTransactionsOutput } from './Output';
import type { HistoryRefreshTrigger } from './RefreshTrigger';
import { PriceRefreshTrigger, ProcessingTransactionRefreshTrigger } from './RefreshTrigger';
import type { HistoryStreamSource, Result } from './SourceStream';
import { AccountStreamSource, EmptyStreamSource, MultipleStreamSource } from './SourceStream';

type AccountSymbol = {
  account: string;
  symbol: string;
};

export enum State {
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
  private _source: HistoryStreamSource = new EmptyStreamSource();

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
  private _error = false;

  constructor(
    private _walletsRepository: WalletsRepository,
    private _notificationService: NotificationService, // accountSymbol?: AccountSymbol
  ) {
    super({ isPaginationEnabled: true, limit: 10 });

    this.accountSymbol = accountSymbol;

    this._outputs = [
      new ProcessingTransactionsOutput(accountSymbol?.account),
      new PriceUpdatingOutput(),
    ];

    // Register all refresh triggers
    for (const trigger of this._refreshTriggers) {
      this.addReaction(trigger.register(() => this.refreshUI()));
    }

    // Build source
    this._buildSource();

    // TODO: tryAgain
    // TODO: refreshPage
  }

  tryAgain(): void {
    this.reload();
    this._error = false;
  }

  refreshPage(): void {
    this.reload();
  }

  protected override onInitialize() {
    // Start loading when wallets are ready.
    this.addReaction(
      when(
        () => (this._walletsRepository.dataObservable?.length ?? 0) > 0,
        () => {
          this.reload();
        },
      ),
    );
  }

  protected override afterReactionsRemoved() {}

  private _buildSource(): void {
    const cachedTransactionRepository = new SolanaTransactionRepository();
    const cachedTransactionParser = new DefaultTransactionParser({
      p2pFeePayers: Defaults.p2pFeePayerPubkeys,
    });

    const accountSymbol = this.accountSymbol;
    if (accountSymbol) {
      this._source = new AccountStreamSource({
        account: accountSymbol.account,
        symbol: accountSymbol.symbol,
        transactionRepository: cachedTransactionRepository,
        transactionParser: cachedTransactionParser,
      });
    } else {
      const accountStreamSources = this._walletsRepository
        .getWallets()
        .reverse()
        .map(
          (wallet) =>
            new AccountStreamSource({
              account: wallet.pubkey ?? '',
              symbol: wallet.token.symbol,
              transactionRepository: cachedTransactionRepository,
              transactionParser: cachedTransactionParser,
            }),
        );

      this._source = new MultipleStreamSource({ sources: accountStreamSources });
    }
  }

  override clear() {
    // Build source
    this._buildSource();

    super.clear();
  }

  override next = flow<ParsedTransaction[], []>(function* (
    this: HistoryViewModel,
  ): Generator<Promise<ParsedTransaction[]>> {
    const results: Result[] = [];
    try {
      while (true) {
        const firstTrx = await this._source.currentItem();
        const rawTime = firstTrx?.signatureInfo.blockTime;
        if (!firstTrx || !rawTime) {
          return yield results;
        }

        // Fetch next 1 days
        const timeEndFilter = new Date(rawTime - 60 * 60 * 24); // TODO: check

        const result: Result | null = null;
        while ((result = await this._source.next({ timestampEnd: timeEndFilter }))) {
          const { signatureInfo } = result;

          // Skip duplicated transaction
          if (this.data.some((tx) => tx.signature === signatureInfo.signature)) {
            continue;
          }
          if (results.some((tx) => tx.signatureInfo.signature === signatureInfo.signature)) {
            continue;
          }

          results.push(result);

          if (results.length > 15) {
            return yield results;
          }
        }
      }
    } catch (error) {
      yield results;
      throw error;
    }

    // TODO:
  });

  override join(newItems: ParsedTransaction[]): ParsedTransaction[] {
    const filteredNewData: ParsedTransaction[] = [];
    for (const trx of newItems) {
      if (this.data.some((tx) => tx.signature === trx.signature)) {
        continue;
      }
      filteredNewData.push(trx);
    }
    return this.data.concat(filteredNewData);
  }

  override map(newData: ParsedTransaction[]): ParsedTransaction[] {
    // Apply output transformation
    let data = [...newData];
    for (const output of this._outputs) {
      data = output.process(data);
    }
    return super.map(data);
  }
}
