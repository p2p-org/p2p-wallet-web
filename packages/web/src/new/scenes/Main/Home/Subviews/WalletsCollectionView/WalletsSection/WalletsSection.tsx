import type { FC } from 'react';

import type { Wallet } from 'new/app/sdk/SolanaSDK';
import type { WalletsRepository } from 'new/services/Repositories';

import { StaticSectionsCollectionView } from '../common/StaticSectionsCollectionView';
import { Title } from '../common/styled';
import { VisibleWalletCell } from '../common/VisibleWalletCell';

interface Props {
  viewModel: WalletsRepository;
}

export const WalletsSection: FC<Props> = ({ viewModel }) => {
  // const configureCell = useCallback(({ item }: { item: SDCollectionViewItem }) => {});
  return (
    <>
      <Title>Tokens</Title>
      <StaticSectionsCollectionView
        viewModel={viewModel}
        keyExtractor={(wallet: Wallet) => wallet.pubkey}
        Cell={VisibleWalletCell}
        // configureCell={configureCell}
        customFilter={(wallet: Wallet) => {
          if (!wallet) {
            return false;
          }

          return !wallet.isHidden;
        }}
      />
    </>
  );
};
