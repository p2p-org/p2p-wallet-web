import dayjs from 'dayjs';
import { groupBy } from 'ramda';

import type { SDListViewModelType } from 'new/core/viewmodels';
import type { SectionInfo } from 'new/ui/components/common/NSDNewDynamicSectionsCollectionView';

export class CollectionViewMappingStrategy {
  static byData<T>({
    viewModel,
    where,
  }: {
    viewModel: Readonly<SDListViewModelType<T>>;
    where: (item: T) => Date;
  }): SectionInfo<T>[] {
    const transactions = viewModel.data;

    const dictionary: [string, T[]][] = Object.entries(
      groupBy<T, string>((item) => where(item).setHours(0, 0, 0, 0).toString(), transactions),
    ).map((value) => [value[0], value[1]]);

    return this._dateFormatter(dictionary);
  }

  private static _dateFormatter<T>(dictionary: [string, T[]][]): SectionInfo<T>[] {
    return dictionary
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map((value) => ({
        userInfo: dayjs(Number(value[0])).format('LL'),
        items: value[1],
      }));
  }
}
