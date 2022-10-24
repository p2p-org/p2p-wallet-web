import { action, makeObservable, observable } from 'mobx';

import type { SDListViewModelType } from './SDListViewModel';
import { SDStreamViewModel } from './SDStreamViewModel';
import { SDFetcherState } from './SDViewModel';

export abstract class SDStreamListViewModel<T>
  extends SDStreamViewModel<T[]>
  implements SDListViewModelType<T>
{
  // Properties

  isPaginationEnabled: boolean;
  customFilter?(item: T): boolean;
  customSorter?(a: T, b: T): number;
  get isEmpty(): boolean {
    return this._isLastPageLoaded && this.data.length === 0;
  }

  // For pagination
  limit: number;
  offset: number;
  private _cache: T[] = [];
  private _isLastPageLoaded = false;

  protected constructor({
    initialData = [],
    isPaginationEnabled = false,
    limit = 10,
    offset = 0,
  }: { initialData?: T[]; isPaginationEnabled?: boolean; limit?: number; offset?: number } = {}) {
    super({ initialData });

    this.isPaginationEnabled = isPaginationEnabled;
    this.limit = limit;
    this.offset = offset;

    makeObservable(this, {
      isPaginationEnabled: observable,

      limit: observable,
      offset: observable,

      fetchNext: action,
      join: action,
      overrideData: action,
      map: action,
      updateItem: action,
    });
  }

  // Actions

  override clear(): void {
    this.offset = 0;
    this._isLastPageLoaded = false;
    super.clear();
  }

  // Asynchronous request handler

  override get isFetchable(): boolean {
    // @ts-ignore
    return super.isFetchable && !this._isLastPageLoaded;
  }

  fetchNext(): void {
    this.fetch();
  }

  override fetch(force = false): void {
    if (force) {
      this.cancelRequest();
    } else if (!this.isFetchable) {
      // there is an running operation
      return;
    }

    this.state = SDFetcherState.loading;
    this._cache = [];

    this.task = this.next();
    this.task
      .then((newData) => {
        this.handleData(newData);
        if (!this.isPaginationEnabled || this._cache.length < this.limit) {
          this._isLastPageLoaded = true;
        }
        this.offset += this.limit;
        this.state = SDFetcherState.loaded;
      })
      .catch((error) => {
        this.handleError(error);
      });

    // this.task = flow<T, []>(function* (
    //   this: SDStreamListViewModel<T>,
    // ): Generator<Promise<T[]>> {
    //   try {
    //     // TODO: check cancellation
    //     const stream = await this.next();
    //     for (const newData of stream) {
    //       // TODO: check cancellation
    //       this.handleData(newData);
    //     }
    //     if (!this.isPaginationEnabled || this._cache.length < this.limit) {
    //       this._isLastPageLoaded = true;
    //     }
    //     this.offset += this.limit;
    //     this.state = SDFetcherState.loaded;
    //   } catch (error) {
    //     if (errorr instanceof Cancellation) {
    //       return;
    //     }
    //     this.handleError(error);
    //   }
    // };
  }

  override handleData(newItems: T[]): void {
    this._cache.push(...newItems);
    const newData = this.join(newItems);

    // map
    const mappedData = this.map(newData);
    super.handleData(mappedData);

    this.state = SDFetcherState.loading;
  }

  join(newItems: T[]): T[] {
    if (!this.isPaginationEnabled) {
      return newItems;
    }
    // TODO: right includes check
    return this.data.concat(newItems.filter((item) => !this.data.includes(item)));
  }

  overrideData(newData: T[]) {
    const _newData = this.map(newData);
    // TODO: check equality!
    if (_newData !== this.data) {
      super.handleData(_newData);
    }
  }

  map(newData: T[]): T[] {
    let _newData = newData; // TODO: check new reference need
    if (this.customFilter) {
      _newData = _newData.filter(this.customFilter);
    }
    if (this.customSorter) {
      _newData = _newData.sort(this.customSorter);
    }
    return _newData;
  }

  setState(state: SDFetcherState, data?: T[]): void {
    this.state = state;
    if (data) {
      this.overrideData(data);
    }
  }

  refreshUI(): void {
    this.overrideData(this.data);
    // TODO: override state
  }

  // TODO: refreshUI?

  getCurrentPage(): number | null {
    if (!(this.isPaginationEnabled && this.limit === 0)) {
      return null;
    }
    return this.offset / this.limit;
  }

  // Helper

  updateItem(predicate: (item: T) => boolean, transform: (item: T) => T): boolean {
    // modify items
    let itemsChanged = false;
    const index = this.data.findIndex(predicate);
    const item = transform(this.data[index]!);
    // TODO: check comparison works right
    if (item !== this.data[index]) {
      itemsChanged = true;
      const data = this.data;
      data[index] = item;
      this.overrideData(data);
    }

    return itemsChanged;
  }
}
