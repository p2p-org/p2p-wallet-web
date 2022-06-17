import type { FC } from 'react';

import type { Wallet } from 'new/app/sdk/SolanaSDK';
import { BaseWalletCell } from 'new/scenes/Main/Home/Subviews/WalletsCollectionView/common/BaseWalletCell';

interface Props {
  item?: Wallet;
  isLoading: boolean;
}

export const VisibleWalletCell: FC<Props> = ({ item, isLoading }) => {
  return <BaseWalletCell wallet={item} isLoading={isLoading} />;
};
