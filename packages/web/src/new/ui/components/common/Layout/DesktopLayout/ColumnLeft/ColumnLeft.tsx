import type { FC } from 'react';
import Sticky from 'react-stickynode';

import { styled } from '@linaria/react';
import { up } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { isEnabled } from 'new/services/FeatureFlags';
import { Features } from 'new/services/FeatureFlags/features';
import {
  COLUMN_LEFT_WIDTH,
  COLUMN_LEFT_WIDTH_MOBILE,
  CONTAINER_PADDING_TOP,
  HEADER_HEIGHT,
} from 'new/ui/components/common/Layout';
import { LeftNavMenu } from 'new/ui/components/common/Layout/DesktopLayout/ColumnLeft/LeftNavMenu';
import { ProfileWidget } from 'new/ui/components/common/Layout/DesktopLayout/ColumnLeft/ProfileWidget';
import type { LayoutViewModel } from 'new/ui/components/common/Layout/Layout.ViewModel';

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

type Props = {
  viewModel: Readonly<LayoutViewModel>;
};

export const ColumnLeft: FC<Props> = observer(({ viewModel }) => {
  return (
    <ColumnLeftSticky top={HEADER_HEIGHT + CONTAINER_PADDING_TOP}>
      <Wrapper>
        {isEnabled(Features.LeftNavMenuProfile) ? <ProfileWidget viewModel={viewModel} /> : null}
        <LeftNavMenu />
      </Wrapper>
    </ColumnLeftSticky>
  );
});
