import type { FC } from 'react';
import { useCallback } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { Icon } from 'components/ui';
import type { Wallet } from 'new/sdk/SolanaSDK';
import type { WalletsRepository } from 'new/services/Repositories';
import { StaticSectionsCollectionView } from 'new/ui/components/common/StaticSectionsCollectionView';

import { Title } from '../common/styled';
import { HidedWalletCell } from './HidedWalletCell';

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

  const handleShowClick = (wallet: Wallet) => {
    viewModel.toggleWalletVisibility(wallet);
  };

  if (!viewModel.hiddenWallets.length) {
    return null;
  }

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
        <StaticSectionsCollectionView<Wallet>
          viewModel={viewModel}
          renderPlaceholder={(key) => <HidedWalletCell key={key} isPlaceholder />}
          renderItem={(wallet: Wallet) => (
            <HidedWalletCell
              key={wallet.pubkey}
              wallet={wallet}
              onShowClick={() => handleShowClick(wallet)}
            />
          )}
          customFilter={customFilter}
        />
      ) : null}
    </>
  );
});
