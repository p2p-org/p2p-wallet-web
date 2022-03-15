import type { FunctionComponent } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { useWallet } from '@p2p-wallet-web/core';

import type { BreadcrumbType } from 'components/common/Layout/types';
import { ScrollFix } from 'components/common/ScollFix';

import { MOBILE_FOOTER_TABS_HEIGHT, MobileFooterTabs } from './MobileFooterTabs';
import { MobileHeader } from './MobileHeader';

const fullHeight = `
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: 1fr ${MOBILE_FOOTER_TABS_HEIGHT}px;
  height: 100vh;
`;

const Container = styled.div`
  ${fullHeight}
`;

const ScrollFixStyled = styled(ScrollFix)`
  ${fullHeight}
`;

const Content = styled.div`
  ${fullHeight}
`;

type Props = {
  breadcrumb?: BreadcrumbType;
  children: React.ReactNode;
};

export const MobileLayoutOrigin: FunctionComponent<Props> = ({ breadcrumb, children }) => {
  const { connected } = useWallet();

  return (
    <Wrapper>
      <Container>
        <ScrollFixStyled>
          <MobileHeader />
          {connected ? <Content>{children}</Content> : undefined}
        </ScrollFixStyled>
      </Container>
      <MobileFooterTabs />
    </Wrapper>
  );
};

export const MobileLayout = React.memo(MobileLayoutOrigin);
