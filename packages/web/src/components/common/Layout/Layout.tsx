import type { FunctionComponent } from 'react';
import * as React from 'react';
import { Helmet } from 'react-helmet';

import { styled } from '@linaria/react';
import { useWallet } from '@p2p-wallet-web/core';
import { up, useIsDesktop, useIsMobile, useIsTablet } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import NProgress from 'nprogress';

import { ScrollFix } from '../ScollFix';
import { ColumnLeft } from './ColumnLeft';
import {
  COLUMN_LEFT_WIDTH,
  COLUMN_LEFT_WIDTH_MOBILE,
  COLUMN_RIGHT_WIDTH,
  COLUMNS_GRID_GUTTER,
  CONTAINER_PADDING_TOP,
} from './constants';
import type { BreadcrumbType } from './Header';
import { Header } from './Header';
import { HEADER_HEIGHT } from './Header/constants';
import { MobileFooterTabs } from './MobileFooterTabs/MobileFooterTabs';
// import { Download } from './Download';

const Wrapper = styled(ScrollFix)``;

const MainScrollFix = styled.div`
  ${up.tablet} {
    padding: 0 20px 170px;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 796px;
  min-height: calc(100vh - ${CONTAINER_PADDING_TOP}px - ${HEADER_HEIGHT}px);
  margin: 0 auto;
  padding-top: ${CONTAINER_PADDING_TOP}px;
`;

const Content = styled.div``;

const ColumnsWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: ${COLUMNS_GRID_GUTTER}px;

  &.isTablet {
    grid-template-columns: ${COLUMN_LEFT_WIDTH_MOBILE}px 1fr;
  }

  &.isDesktop {
    grid-template-columns: ${COLUMN_LEFT_WIDTH}px 1fr;
  }
`;

const ColumnRightWrapper = styled.div`
  max-width: ${COLUMN_RIGHT_WIDTH}px;
  height: fit-content;
`;

const ColumnRight = styled.div`
  display: grid;
  grid-gap: 24px;
  grid-template-rows: min-content;
`;

const CenteredWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

NProgress.configure({ showSpinner: false, parent: '#container' });

type Props = {
  breadcrumb?: BreadcrumbType;
  leftColumn?: React.ReactNode;
  rightColumn?: React.ReactNode;
  centered?: React.ReactNode;
};

export const LayoutOrigin: FunctionComponent<Props> = ({
  breadcrumb,
  leftColumn,
  rightColumn,
  centered,
  children,
}) => {
  const { connected } = useWallet();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  // useEffect(() => {
  //   if (loading) {
  //     NProgress.start();
  //   } else {
  //     NProgress.done();
  //   }
  // }, [loading]);

  return (
    <>
      <Helmet>
        <body className="" />
      </Helmet>
      <Wrapper>
        <Header breadcrumb={breadcrumb} />
        <MainScrollFix id="container">
          <Container>
            {connected ? (
              <Content>
                {rightColumn ? (
                  <ColumnsWrapper className={classNames({ isTablet, isDesktop })}>
                    {isTablet ? <ColumnLeft leftColumn={leftColumn} /> : undefined}
                    <ColumnRightWrapper>
                      <ColumnRight>{rightColumn}</ColumnRight>
                    </ColumnRightWrapper>
                  </ColumnsWrapper>
                ) : centered ? (
                  <CenteredWrapper>{centered}</CenteredWrapper>
                ) : (
                  children
                )}
              </Content>
            ) : undefined}
          </Container>
        </MainScrollFix>
        {isMobile ? <MobileFooterTabs /> : undefined}
      </Wrapper>
    </>
  );
};

export const Layout = React.memo(LayoutOrigin);
