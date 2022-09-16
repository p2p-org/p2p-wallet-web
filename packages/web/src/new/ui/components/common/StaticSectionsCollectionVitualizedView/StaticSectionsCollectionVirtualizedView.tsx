import React, { useMemo, useRef } from 'react';
import { useVirtual } from 'react-virtual';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';
import { nanoid } from 'nanoid';

import type { ISDListViewModel } from 'new/core/viewmodels/SDListViewModel';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import { SDCollectionViewItem } from 'new/ui/components/common/StaticSectionsCollectionView/models/SDCollectionViewItem';

const Wrapper = styled.div`
  height: 100px;
  overflow-y: auto;
`;

const Container = styled.div``;

interface Props<T> {
  viewModel: Readonly<ISDListViewModel<T>>;
  numberOfLoadingCells?: number;
  renderPlaceholder: () => React.ReactNode;
  renderItem: (item: T) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  customFilter?: (item: T) => boolean;
  transformer?: (items: T[]) => T[];
  className?: string;
}

export const StaticSectionsCollectionVirtualizedView = observer(
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
    const parentRef = useRef<HTMLDivElement>(null);

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

    const rowVirtualizer = useVirtual({
      paddingStart: 0,
      paddingEnd: 8,
      size: items.length,
      parentRef: parentRef,
      overscan: 6,
    });

    if (items.length === 0) {
      return null;
    }

    const renderRow = (item: SDCollectionViewItem<T>) => {
      if (!item.isEmptyCell) {
        if (item.isPlaceholder) {
          return renderPlaceholder();
        }

        return renderItem(item.value!);
      }

      if (item.isEmptyCell && renderEmpty) {
        return renderEmpty();
      }

      return null;
    };

    return (
      <Wrapper className={className} ref={parentRef}>
        <Container
          style={{
            position: 'relative',
            width: '100%',
            height: rowVirtualizer.totalSize,
          }}
        >
          {rowVirtualizer.virtualItems.map((virtualRow) => (
            <div
              ref={virtualRow.measureRef}
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderRow(items[virtualRow.index]!)}
            </div>
          ))}
        </Container>
      </Wrapper>
    );
  },
);
