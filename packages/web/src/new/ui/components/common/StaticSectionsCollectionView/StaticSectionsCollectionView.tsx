import React, { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';
import { nanoid } from 'nanoid';

import type { ISDListViewModel } from 'new/core/viewmodels/SDListViewModel';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';

import { SDCollectionViewItem } from './models/SDCollectionViewItem';

interface Props<T> {
  viewModel: Readonly<ISDListViewModel<T>>;
  numberOfLoadingCells?: number;
  renderPlaceholder?: (key: string) => React.ReactNode;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEmpty?: (key: string) => React.ReactNode;
  customFilter?: (item: T) => boolean;
  transformer?: (items: T[]) => T[];
  className?: string;
}

export const StaticSectionsCollectionView = observer(
  <T,>({
    viewModel,
    numberOfLoadingCells = 2,
    renderPlaceholder,
    renderItem,
    renderEmpty,
    customFilter,
    transformer,
    className,
  }: Props<T>) => {
    const items = useMemo(
      () =>
        expr(() => {
          let _items = viewModel.data;

          if (customFilter) {
            _items = _items.filter(customFilter);
          }

          if (transformer) {
            _items = transformer(_items);
          }

          const collectionViewItems = _items.map(
            (item) => new SDCollectionViewItem({ value: item }),
          );
          switch (viewModel.state) {
            case SDFetcherState.initializing:
            case SDFetcherState.loading:
              for (let i = 0; i < numberOfLoadingCells; i++) {
                collectionViewItems.push(new SDCollectionViewItem({ placeholderIndex: nanoid() }));
              }
              break;
            case SDFetcherState.loaded:
              if (collectionViewItems.length === 0 && renderEmpty) {
                collectionViewItems.push(new SDCollectionViewItem({ emptyCellIndex: nanoid() }));
              }
              break;
            case SDFetcherState.error:
              break;
          }
          return collectionViewItems;
        }),
      [customFilter, numberOfLoadingCells, renderEmpty, viewModel.data, viewModel.state],
    );

    if (items.length === 0) {
      return null;
    }

    return (
      <div className={className}>
        {items.map((item, index) => {
          if (!item.isEmptyCell) {
            if (item.isPlaceholder) {
              return renderPlaceholder?.(item.placeholderIndex!);
            }

            return renderItem(item.value!, index);
          }

          if (item.isEmptyCell && renderEmpty) {
            return renderEmpty(item.emptyCellIndex!);
          }

          return null;
        })}
      </div>
    );
  },
);
