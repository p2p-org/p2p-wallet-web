import type { FC } from 'react';
import Sticky from 'react-stickynode';

import { styled } from '@linaria/react';
import { up } from '@p2p-wallet-web/ui';

import {
  COLUMN_LEFT_WIDTH,
  COLUMN_LEFT_WIDTH_MOBILE,
  CONTAINER_PADDING_TOP,
} from 'components/common/Layout';
import { ProfileWidget } from 'components/common/Layout/DesktopLayout/ColumnLeft/ProfileWidget';
import { HEADER_HEIGHT } from 'components/common/Layout/DesktopLayout/Header';

import { LeftNavMenu } from './LeftNavMenu';

const ColumnLeftSticky = styled(Sticky)`
  height: fit-content;

  ${up.tablet} {
    width: ${COLUMN_LEFT_WIDTH_MOBILE}px;
  }

  ${up.desktop} {
    width: 100%;
    max-width: ${COLUMN_LEFT_WIDTH}px;
  }
`;

const Wrapper = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-rows: min-content;
`;

export const ColumnLeft: FC = () => {
  return (
    <ColumnLeftSticky top={HEADER_HEIGHT + CONTAINER_PADDING_TOP}>
      <Wrapper>
        <ProfileWidget />
        <LeftNavMenu />
        {/* <Download /> */}
      </Wrapper>
    </ColumnLeftSticky>
  );
};
