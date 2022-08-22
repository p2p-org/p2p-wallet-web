import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import type { SendViewModelType } from 'new/scenes/Main/Send';

const Wrapper = styled.div``;

interface Props {
  viewModel: Readonly<SendViewModelType>;
}

export const FeeView: FC<Props> = observer(({ viewModel }) => {
  return <Wrapper>1</Wrapper>;
});
