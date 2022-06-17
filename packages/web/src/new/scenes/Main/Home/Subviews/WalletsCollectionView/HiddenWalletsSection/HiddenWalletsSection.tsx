import type { FC } from 'react';
import { useCallback } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { Icon } from 'components/ui';
import type { Wallet } from 'new/app/sdk/SolanaSDK';
import { StaticSectionsCollectionView } from 'new/scenes/Main/Home/Subviews/WalletsCollectionView/common/StaticSectionsCollectionView';
import { Title } from 'new/scenes/Main/Home/Subviews/WalletsCollectionView/common/styled';
import { VisibleWalletCell } from 'new/scenes/Main/Home/Subviews/WalletsCollectionView/common/VisibleWalletCell';
import type { WalletsRepository } from 'new/services/Repositories';

const ChevronIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  color: ${theme.colors.textIcon.secondary};
`;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  transform: rotate(0deg);
  cursor: pointer;

  &.isOpen {
    transform: rotate(180deg);
  }
`;

interface Props {
  viewModel: WalletsRepository;
}

export const HiddenWalletsSection: FC<Props> = observer(({ viewModel }) => {
  const handleChevronClick = () => {
    viewModel.toggleIsHiddenWalletShown();
  };

  const customFilter = useCallback((wallet: Wallet) => {
    if (!wallet) {
      return false;
    }

    return wallet.isHidden;
  }, []);

  return (
    <>
      <Title
        onClick={handleChevronClick}
        className={classNames({ isOpen: viewModel.isHiddenWalletsShown })}
      >
        Hidden token{viewModel.hiddenWallets.length !== 1 ? 's' : ''}
        <ChevronWrapper className={classNames({ isOpen: viewModel.isHiddenWalletsShown })}>
          <ChevronIcon name="chevron" />
        </ChevronWrapper>
      </Title>
      {viewModel.isHiddenWalletsShown ? (
        <StaticSectionsCollectionView
          viewModel={viewModel}
          keyExtractor={(wallet: Wallet) => wallet.pubkey}
          Cell={VisibleWalletCell}
          customFilter={customFilter}
        />
      ) : null}
    </>
  );
});
