import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import type { ProcessTransactionViewModel } from 'new/scenes/Main/ProcessTransaction';

const Wrapper = styled.div``;

interface Props {
  viewModel: ProcessTransactionViewModel;
}

export const HeaderLabel: FC<Props> = observer(({ viewModel }) => {
  return <Wrapper>HeaderLabel</Wrapper>;
});
