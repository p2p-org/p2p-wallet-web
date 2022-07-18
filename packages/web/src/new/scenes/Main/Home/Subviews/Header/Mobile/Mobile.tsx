import type { FC } from 'react';

import { styled } from '@linaria/react';

import type { HomeViewModel } from 'new/scenes/Main/Home';

import { BalanceView } from '../common/BalanceView';

const Wrapper = styled.div`
  padding: 16px 0 8px;
`;

interface Props {
  viewModel: HomeViewModel;
}

export const Mobile: FC<Props> = ({ viewModel }) => {
  return (
    <Wrapper>
      <BalanceView viewModel={viewModel} />
    </Wrapper>
  );
};
