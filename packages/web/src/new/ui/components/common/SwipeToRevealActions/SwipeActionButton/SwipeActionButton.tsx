import type { FC, HTMLAttributes } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { SWIPE_ACTION_BUTTON_SIZE } from './constants';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: ${SWIPE_ACTION_BUTTON_SIZE}px;
  height: ${SWIPE_ACTION_BUTTON_SIZE}px;

  color: ${theme.colors.textIcon.secondary};
`;

type Props = HTMLAttributes<HTMLDivElement>;

export const SwipeActionButton: FC<Props> = ({ children, onClick }) => {
  return <Wrapper onClick={onClick}>{children}</Wrapper>;
};
