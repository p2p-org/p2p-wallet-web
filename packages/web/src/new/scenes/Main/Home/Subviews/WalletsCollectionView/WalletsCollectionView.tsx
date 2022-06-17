import type { FC } from 'react';

import { styled } from '@linaria/react';
import { up } from '@p2p-wallet-web/ui';

import { HiddenWalletsSection } from 'new/scenes/Main/Home/Subviews/WalletsCollectionView/HiddenWalletsSection';
import { WalletsSection } from 'new/scenes/Main/Home/Subviews/WalletsCollectionView/WalletsSection';
import type { WalletsRepository } from 'new/services/Repositories';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 8px;

  ${up.tablet} {
    grid-gap: 16px;
    margin: initial;
  }
`;

interface Props {
  viewModel: WalletsRepository;
}

export const WalletsCollectionView: FC<Props> = ({ viewModel }) => {
  return (
    <Wrapper>
      <WalletsSection viewModel={viewModel} />
      <HiddenWalletsSection viewModel={viewModel} />
    </Wrapper>
  );
};
