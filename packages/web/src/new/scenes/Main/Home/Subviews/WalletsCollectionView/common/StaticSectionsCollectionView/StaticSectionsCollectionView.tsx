import type { FC } from 'react';
import React, { useMemo } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';
import { nanoid } from 'nanoid';

import { SDCollectionViewItem } from 'new/app/models/SDCollectionViewItem';
import type { ISDListViewModel } from 'new/viewmodels/SDListViewModel';
import { SDFetcherState } from 'new/viewmodels/SDViewModel';

const Wrapper = styled.div``;

interface Props {
  viewModel: ISDListViewModel;
  numberOfLoadingCells?: number;
  Cell: React.ElementType;
  EmptyCell?: React.ElementType;
  customFilter?: (item: any) => boolean;
  configureCell?: ({ item }: { item: SDCollectionViewItem }) => void;
}

export const StaticSectionsCollectionView: FC<Props> = observer(
  ({ viewModel, numberOfLoadingCells = 2, Cell, EmptyCell = null, customFilter }) => {
    const items = useMemo(() => {
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
          if (collectionViewItems.length === 0 && EmptyCell) {
            collectionViewItems.push(new SDCollectionViewItem({ emptyCellIndex: nanoid() }));
          }
          break;
        case SDFetcherState.error:
          break;
      }
      return collectionViewItems;
    }, [EmptyCell, numberOfLoadingCells, viewModel.data, viewModel.state]);

    console.log(111, items);

    return (
      <Wrapper>
        {items.map((item) => {
          if (!item.isEmptyCell) {
            return <Cell item={item.value} isLoading={item.isPlaceholder} />;
          }

          if (item.isEmptyCell && EmptyCell) {
            return <EmptyCell key={item.emptyCellIndex} />;
          }

          return null;
        })}
      </Wrapper>
    );
  },
);
