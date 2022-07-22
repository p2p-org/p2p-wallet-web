import type { FC } from 'react';

import { styled } from '@linaria/react';
import { up } from '@p2p-wallet-web/ui';

import type { WalletsRepository } from 'new/services/Repositories';

import { HiddenWalletsSection } from './HiddenWalletsSection';
import { WalletsSection } from './WalletsSection';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 8px;
  margin: 0 -18px;

  ${up.tablet} {
    grid-gap: 16px;
    margin: initial;
  }
`;

interface Props {
  viewModel: Readonly<WalletsRepository>;
}

export const WalletsCollectionView: FC<Props> = ({ viewModel }) => {
  return (
    <Wrapper>
      <WalletsSection viewModel={viewModel} />
      <HiddenWalletsSection viewModel={viewModel} />
    </Wrapper>
  );
};
