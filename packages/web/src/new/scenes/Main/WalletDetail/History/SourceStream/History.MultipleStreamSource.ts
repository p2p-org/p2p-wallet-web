import type { FetchingConfiguration, Result } from './History.StreamSource';
import { HistoryStreamSource } from './History.StreamSource';

/// The class that merges many sources into one and represents as single stream of sequential transactions.
///
/// The items can be emits two or more times if transaction belongs to many streams.
export class MultipleStreamSource extends HistoryStreamSource {
  /// The list of sources
  private _sources: HistoryStreamSource[];

  /// A stream's buffer of transactions
  private _buffer: Result[] = [];

  constructor({ sources }: { sources: HistoryStreamSource[] }) {
    super();
    this._sources = sources;
  }

  async currentItem(): Promise<Result | null> {
    const items = await Promise.all(this._sources.map((source) => source.currentItem()));
    return items.reduce((mostFirst, trx) => {
      const t1 = trx?.signatureInfo.blockTime;
      if (!t1) {
        return mostFirst;
      }
      const t2 = mostFirst?.signatureInfo.blockTime;
      if (!t2) {
        return null;
      }
      if (t1 > t2) {
        return trx;
      }
      return mostFirst;
    }, null);
  }

  async *next(configuration: FetchingConfiguration): AsyncGenerator<Result> {
    if (this._buffer.length === 0) {
      await this._fillBuffer(configuration);
    }

    const item = this._buffer[0];
    if (!item) {
      return null;
    }
    this._buffer.splice(0);
    yield item;
  }

  /// A method that fills a buffer
  private async _fillBuffer(configuration: FetchingConfiguration): Promise<void> {
    const group = [];
    for (const source of this._sources) {
      group.push(await source.nextItems(configuration));
    }
    const newResults: Result[] = group.reduce((acc, cur) => acc.concat(cur), []);

    this._buffer.push(...newResults);
    // TODO: check sort
    this._buffer.sort((left, right) => {
      const leftTime = left.signatureInfo.blockTime;
      const rightTime = right.signatureInfo.blockTime;
      if (!leftTime || !rightTime) {
        return -1;
      }
      return leftTime - rightTime;
    });
  }

  async reset(): Promise<void> {
    this._buffer = [];
    for (const source of this._sources) {
      await source.reset();
    }
  }
}
