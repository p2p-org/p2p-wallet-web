import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { MOBILE_HEADER_HEIGHT } from './constants';

const Wrapper = styled.div`
  height: ${MOBILE_HEADER_HEIGHT}px;

  border-bottom: 1px solid ${theme.colors.stroke.tertiary};
`;

export const MobileHeader: FC = () => {
  return <Wrapper />;
};
