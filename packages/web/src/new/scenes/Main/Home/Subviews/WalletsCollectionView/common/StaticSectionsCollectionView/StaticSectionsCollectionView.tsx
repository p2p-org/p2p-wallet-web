import React from 'react';

import { styled } from '@linaria/react';
import { computed } from 'mobx';
import { observer } from 'mobx-react-lite';
import { nanoid } from 'nanoid';

import { SDCollectionViewItem } from 'new/app/models/SDCollectionViewItem';
import type { ISDListViewModel } from 'new/core/viewmodels/SDListViewModel';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';

const Wrapper = styled.div``;

interface Props<T> {
  viewModel: ISDListViewModel<T>;
  numberOfLoadingCells?: number;
  renderPlaceholder: (key: string) => React.ReactNode;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEmpty?: (key: string) => React.ReactNode;
  customFilter?: (item: T) => boolean;
  configureCell?: ({ item }: { item: SDCollectionViewItem }) => void;
}

export const StaticSectionsCollectionView = observer(
  <T,>({
    viewModel,
    numberOfLoadingCells = 2,
    renderPlaceholder,
    renderItem,
    renderEmpty,
    customFilter,
  }: Props<T>) => {
    const items = computed(() => {
      let _items = viewModel.data;

      if (customFilter) {
        _items = _items.filter(customFilter);
      }

      const collectionViewItems = _items.map((item) => new SDCollectionViewItem({ value: item }));
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
    }).get();

    return (
      <Wrapper>
        {items.map((item, index) => {
          if (!item.isEmptyCell) {
            if (item.isPlaceholder) {
              return renderPlaceholder(item.placeholderIndex!);
            }

            return renderItem(item.value, index);
          }

          if (item.isEmptyCell && renderEmpty) {
            return renderEmpty(item.emptyCellIndex!);
          }

          return null;
        })}
      </Wrapper>
    );
  },
);
