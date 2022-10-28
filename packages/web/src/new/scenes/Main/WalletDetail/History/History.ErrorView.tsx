import type { FC } from 'react';

import { styled } from '@linaria/react';

const Wrapper = styled.div``;

interface Props {
  onClick: () => void;
}

// TDOO: error
export const ErrorView: FC<Props> = ({ onClick }) => {
  return <Wrapper onClick={onClick}>ErrorView</Wrapper>;
};
