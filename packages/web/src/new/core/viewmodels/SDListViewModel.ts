import { action, makeObservable, observable } from 'mobx';

import type { SDFetcherState } from './SDViewModel';
import { SDViewModel } from './SDViewModel';

export interface SDListViewModelType<T> {
  readonly state: SDFetcherState;
  readonly isPaginationEnabled: boolean;

  reload(): void;
  fetchNext(): void;

  getCurrentPage(): number | null;

  data: T[];

  // own
  readonly isFetchable: boolean;
}

export abstract class SDListViewModel<T>
  extends SDViewModel<T[]>
  implements SDListViewModelType<T>
{
  // Properties

  isPaginationEnabled: boolean;
  customFilter?(item: T): boolean;
  customSorter?(a: T, b: T): number;

  // For pagination

  limit: number;
  offset: number;
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

  override flush(): void {
    this.offset = 0;
    this._isLastPageLoaded = false;
    super.flush();
  }

  // Asynchronous request handler
  override get isFetchable(): boolean {
    // @ts-ignore
    return super.isFetchable && !this._isLastPageLoaded;
  }

  fetchNext(): void {
    super.request();
  }

  override handleNewData(newItems: T[]): void {
    const _newData = this.join(newItems);

    // resign state
    if (!this.isPaginationEnabled || newItems.length < this.limit) {
      this._isLastPageLoaded = true;
    }

    // map
    const mappedData = this.map(_newData);
    super.handleNewData(mappedData);

    // get next offset
    this.offset += this.limit;
  }

  join(newItems: T[]): T[] {
    if (!this.isPaginationEnabled) {
      return newItems;
    }
    // TODO: right includes check
    return this.data.concat(newItems.filter((item) => !this.data.includes(item)));
  }

  overrideData(newData: T[]): void {
    const _newData = this.map(newData);
    // TODO: check equality!
    if (_newData !== this.data) {
      super.handleNewData(_newData);
    }
  }

  map(newData: T[]): T[] {
    let _newData = newData;
    if (this.customFilter) {
      _newData = _newData.filter(this.customFilter);
    }
    if (this.customSorter) {
      _newData = _newData.sort(this.customSorter);
    }
    return _newData;
  }

  getCurrentPage(): number | null {
    if (!this.isPaginationEnabled || this.limit === 0) {
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
