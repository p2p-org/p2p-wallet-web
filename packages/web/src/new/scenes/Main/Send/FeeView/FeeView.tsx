import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

const Wrapper = styled.div``;

interface Props {}

export const FeeView: FC<Props> = observer((props) => {
  return <Wrapper>FeeView</Wrapper>;
});
