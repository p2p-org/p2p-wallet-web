import type { FC } from 'react';

import { styled } from '@linaria/react';

const Wrapper = styled.div``;

interface Props {
  onClick: () => void;
}

export const EmptyTransactionsView: FC<Props> = ({ onClick }) => {
  return <Wrapper onClick={onClick}>EmptyTransactionsView</Wrapper>;
};
