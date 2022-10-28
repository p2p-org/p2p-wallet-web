import React, { useMemo } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';
import { nanoid } from 'nanoid';

import { InfinityScrollHelper } from 'components/common/InfinityScrollHelper';
import type { SDListViewModelType } from 'new/core/viewmodels/SDListViewModel';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';

import { SDCollectionViewItem } from '../StaticSectionsCollectionView/models/SDCollectionViewItem';

const TitleDate = styled.div`
  margin: 0 10px;

  color: #a3a5ba;
  font-size: 14px;
  line-height: 30px;
`;

export interface SectionInfo<T> {
  userInfo: string;
  items: T[];
}

interface Props<T> {
  viewModel: Readonly<SDListViewModelType<T>>;
  mapDataToSections: (viewModel: Readonly<SDListViewModelType<T>>) => SectionInfo<T>[];
  numberOfLoadingCells?: number;
  renderPlaceholder: (key: string) => React.ReactNode;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEmpty?: (key: string) => React.ReactNode;
  className?: string;
}

export const NSDNewDynamicSectionsCollectionView = observer(
  <T,>({
    viewModel,
    mapDataToSections,
    numberOfLoadingCells = 2,
    renderPlaceholder,
    renderItem,
    renderEmpty,
    className,
  }: Props<T>) => {
    const sections = useMemo(
      () =>
        expr(() => {
          const sections = mapDataToSections(viewModel);

          const collectionViewSections = sections.map((section) => ({
            userInfo: section.userInfo,
            items: section.items.map((item) => new SDCollectionViewItem<T>({ value: item })),
          }));
          switch (viewModel.state) {
            case SDFetcherState.initializing:
            case SDFetcherState.loading: {
              const _items = [];
              for (let i = 0; i < numberOfLoadingCells; i++) {
                _items.push(new SDCollectionViewItem<T>({ placeholderIndex: nanoid() }));
              }
              collectionViewSections.push({ userInfo: 'placeholder', items: _items });
              break;
            }
            case SDFetcherState.loaded: {
              const _items = [];
              if (collectionViewSections.length === 0 && renderEmpty) {
                _items.push(new SDCollectionViewItem<T>({ emptyCellIndex: nanoid() }));
              }
              collectionViewSections.push({ userInfo: 'placeholder', items: _items });
              break;
            }
            case SDFetcherState.error:
              break;
          }

          return collectionViewSections;
        }),
      [numberOfLoadingCells, renderEmpty, viewModel.data, viewModel.state],
    );

    if (sections.length === 0) {
      return null;
    }

    return (
      <div className={className}>
        <InfinityScrollHelper
          disabled={!viewModel.isFetchable}
          onNeedLoadMore={() => viewModel.fetchNext()}
        >
          {sections.map((section) => (
            <div key={section.userInfo}>
              {!['placeholder', 'empty'].includes(section.userInfo) ? (
                <TitleDate>{section.userInfo}</TitleDate>
              ) : null}
              {section.items.map((item, index) => {
                if (!item.isEmptyCell) {
                  if (item.isPlaceholder) {
                    return renderPlaceholder(item.placeholderIndex!);
                  }

                  return renderItem(item.value!, index);
                }

                if (item.isEmptyCell && renderEmpty) {
                  return renderEmpty(item.emptyCellIndex!);
                }

                return null;
              })}
            </div>
          ))}
        </InfinityScrollHelper>
      </div>
    );
  },
);
