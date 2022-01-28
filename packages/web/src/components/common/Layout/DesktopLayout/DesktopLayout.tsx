import type { FunctionComponent } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { useWallet } from '@p2p-wallet-web/core';
import { up, useIsDesktop, useIsTablet } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { ScrollFix } from '../../ScollFix';
import {
  COLUMN_LEFT_WIDTH,
  COLUMN_LEFT_WIDTH_MOBILE,
  COLUMN_RIGHT_WIDTH,
  COLUMNS_GRID_GUTTER,
  CONTAINER_PADDING_TOP,
} from '../constants';
import type { BreadcrumbType } from '../types';
import { ColumnLeft } from './ColumnLeft';
import { Header } from './Header';
import { HEADER_HEIGHT } from './Header/constants';

const Wrapper = styled.div``;

const MainScrollFix = styled(ScrollFix)`
  padding: 0 20px 170px;
`;

const Container = styled.div`
  width: 100%;
  max-width: 796px;
  min-height: calc(100vh - ${CONTAINER_PADDING_TOP}px - ${HEADER_HEIGHT}px);
  margin: 0 auto;

  ${up.tablet} {
    padding-top: ${CONTAINER_PADDING_TOP}px;
  }
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

type Props = {
  breadcrumb?: BreadcrumbType;
  children: React.ReactNode;
};

export const DesktopLayoutOrigin: FunctionComponent<Props> = ({ breadcrumb, children }) => {
  const { connected } = useWallet();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  return (
    <Wrapper>
      <Header breadcrumb={breadcrumb} />
      <MainScrollFix id="container">
        <Container>
          {connected ? (
            <Content>
              <ColumnsWrapper className={classNames({ isTablet, isDesktop })}>
                <ColumnLeft />
                <ColumnRightWrapper>
                  <ColumnRight>{children}</ColumnRight>
                </ColumnRightWrapper>
              </ColumnsWrapper>
            </Content>
          ) : undefined}
        </Container>
      </MainScrollFix>
    </Wrapper>
  );
};

export const DesktopLayout = React.memo(DesktopLayoutOrigin);
