import type { FC } from 'react';

import type { Wallet } from 'new/sdk/SolanaSDK';
import type { WalletsRepository } from 'new/services/Repositories';

import { StaticSectionsCollectionViewStyled, Title } from '../common/styled';
import { VisibleWalletCell } from './VisibleWalletCell';

interface Props {
  viewModel: Readonly<WalletsRepository>;
}

export const WalletsSection: FC<Props> = ({ viewModel }) => {
  const handleHideClick = (wallet: Wallet) => {
    viewModel.toggleWalletVisibility(wallet);
  };

  return (
    <>
      <Title>Tokens</Title>
      <StaticSectionsCollectionViewStyled<Wallet>
        viewModel={viewModel}
        renderPlaceholder={(key) => <VisibleWalletCell key={key} isPlaceholder />}
        renderItem={(wallet: Wallet) => (
          <VisibleWalletCell
            key={wallet.pubkey}
            wallet={wallet}
            onHideClick={() => handleHideClick(wallet)}
          />
        )}
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
