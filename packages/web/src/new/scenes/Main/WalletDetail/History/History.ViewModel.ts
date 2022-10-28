import { action, flow, makeObservable, when } from 'mobx';
import { singleton } from 'tsyringe';

import { SDFetcherState, SDStreamListViewModel } from 'new/core/viewmodels';
import type { Wallet } from 'new/sdk/SolanaSDK';
import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import { Defaults } from 'new/services/Defaults';
import { NotificationService } from 'new/services/NotificationService';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { WalletsRepository } from 'new/services/Repositories';
import { SolanaService } from 'new/services/SolanaService';
import { TransactionHandler } from 'new/services/TransactionHandler';

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
  transactionRepository = new SolanaTransactionRepository({
    solanaAPIClient: this._solanaAPIClient,
  });
  transactionParser = new DefaultTransactionParser({
    p2pFeePayers: Defaults.p2pFeePayerPubkeys,
    solanaAPIClient: this._solanaAPIClient,
  });

  // Properties

  /// Symbol to filter coins
  accountSymbol?: AccountSymbol;

  /// Refresh handling
  private _refreshTriggers: HistoryRefreshTrigger[] = [
    new PriceRefreshTrigger({ pricesService: this._pricesService }),
    new ProcessingTransactionRefreshTrigger({ transactionHandler: this._transactionHandler }),
  ];

  /// A list of source, where data can be fetched
  private _source: HistoryStreamSource = new EmptyStreamSource();

  /// A list of output objects, that builds, forms, maps, filters and updates a final list.
  /// This list will be delivered to UI layer.
  private _outputs: HistoryOutput[];

  get stateDriver(): State {
    const change = this.dataObservable; // TODO: check, should be "withPrevious"
    const state = this.stateObservable;
    const error = this._errorRelay;
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
  private _errorRelay = false;

  constructor(
    private _walletsRepository: WalletsRepository,
    private _notificationService: NotificationService, // accountSymbol?: AccountSymbol
    // @web: for dependencies
    private _solanaAPIClient: SolanaService,
    private _transactionHandler: TransactionHandler,
    private _pricesService: PricesService,
  ) {
    super({ isPaginationEnabled: true, limit: 10 });

    // TODO: tryAgain
    // TODO: refreshPage

    makeObservable(this, {
      setAccountSymbol: action,
      next: flow,
    });
  }

  protected override setDefaults(): void {
    // TODO:
  }

  tryAgain(): void {
    this.reload();
    this._errorRelay = false;
  }

  refreshPage(): void {
    this.reload();
  }

  protected override onInitialize(): void {}

  protected override afterReactionsRemoved(): void {}

  // we need to
  setAccountSymbol(wallet: Wallet): void {
    this.end();

    this.accountSymbol = {
      account: wallet.pubkey!,
      symbol: wallet.token.symbol,
    };

    this._outputs = [
      new ProcessingTransactionsOutput({
        accountFilter: this.accountSymbol?.account,
        transactionHandler: this._transactionHandler,
      }),
      new PriceUpdatingOutput({ pricesService: this._pricesService }),
    ];

    // Register all refresh triggers
    for (const trigger of this._refreshTriggers) {
      this.addReaction(trigger.register(() => this.refreshUI()));
    }

    // Build source
    this._buildSource();

    this._bind();

    this.initialize();
  }

  private _bind(): void {
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

  private _buildSource(): void {
    const cachedTransactionRepository = new SolanaTransactionRepository({
      solanaAPIClient: this._solanaAPIClient,
    });
    const cachedTransactionParser = new DefaultTransactionParser({
      p2pFeePayers: Defaults.p2pFeePayerPubkeys,
      solanaAPIClient: this._solanaAPIClient,
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

  private _next = flow<Result[], []>(async function* (
    this: HistoryViewModel,
  ): AsyncGenerator<Result[]> {
    const results: Result[] = [];
    try {
      while (true) {
        const firstTrx = await this._source.currentItem();
        const rawTime = firstTrx?.signatureInfo.blockTime;
        if (!firstTrx || !rawTime) {
          return results;
        }

        // Fetch next 1 days
        const timeEndFilter = new Date(rawTime * 1000 - 60 * 60 * 24 * 1000); // TODO: check

        const items = this._source.next({ timestampEnd: timeEndFilter });
        let result: IteratorResult<Result> | null = null;
        while (!(result = await items.next()).done) {
          const { signatureInfo } = result.value;

          // Skip duplicated transaction
          if (this.data.some((tx) => tx.signature === signatureInfo.signature)) {
            continue;
          }
          if (results.some((tx) => tx.signatureInfo.signature === signatureInfo.signature)) {
            continue;
          }

          results.push(result.value);

          if (results.length > 15) {
            return results;
          }
        }
      }
    } catch (error) {
      console.error(error);
      yield results;
      throw error;
    }
  });

  override next = flow<ParsedTransaction[], []>(function* (
    this: HistoryViewModel,
  ): Generator<Promise<ParsedTransaction[]>> {
    try {
      return yield this._next().then(async (signatures: Result[]) => {
        const transactions = await this.transactionRepository.getTransactions(
          signatures.map((s) => s.signatureInfo.signature),
        );
        const parsedTransactions: ParsedTransaction[] = [];

        // TODO: maybe parallel
        for (const trxInfo of transactions) {
          if (!trxInfo) {
            continue;
          }
          const signature = signatures.find(
            (res) => res.signatureInfo.signature === trxInfo.transaction.signatures[0],
          );
          if (!signature) {
            continue;
          }
          const { signatureInfo, account, symbol } = signature;

          parsedTransactions.push(
            await this.transactionParser.parse({
              signatureInfo,
              transactionInfo: trxInfo,
              account,
              symbol,
            }),
          );
        }

        return parsedTransactions;
      });
    } catch (error) {
      // TODO: check it works
      console.error(error);
      this._errorRelay = true;
      this._notificationService.error((error as Error).message);
    }
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
