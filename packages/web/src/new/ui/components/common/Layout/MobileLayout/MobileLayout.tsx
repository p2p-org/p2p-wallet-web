import type { FC } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import type { BreadcrumbType } from 'new/ui/components/common/Layout';
import { MOBILE_FOOTER_TABS_HEIGHT, MobileFooterTabs } from 'new/ui/components/common/Layout';
import type { LayoutViewModel } from 'new/ui/components/common/Layout/Layout.ViewModel';
import { MobileHeader } from 'new/ui/components/common/Layout/MobileLayout/MobileHeader';
import { ScrollFix } from 'new/ui/components/common/ScollFix';

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
  viewModel: LayoutViewModel;
  breadcrumb?: BreadcrumbType;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export const MobileLayout: FC<Props> = observer(({ viewModel, action, children }) => {
  return (
    <Wrapper>
      <Container>
        <ScrollFixStyled>
          <MobileHeader viewModel={viewModel} action={action} />
          {viewModel.walletConnected ? <Content>{children}</Content> : undefined}
        </ScrollFixStyled>
      </Container>
      <MobileFooterTabs viewModel={viewModel} />
    </Wrapper>
  );
});
