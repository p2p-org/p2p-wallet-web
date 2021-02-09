import React, { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Sticky from 'react-stickynode';

import { styled } from '@linaria/react';
import NProgress from 'nprogress';

import { RootState } from 'store/rootReducer';

import { BreadcrumbType, Header, HEADER_HEIGHT } from '../Header';
import { ScrollFix } from '../ScollFix';
import {
  COLUMN_LEFT_WIDTH,
  COLUMN_RIGHT_WIDTH,
  COLUMNS_GRID_GUTTER,
  CONTAINER_PADDING_TOP,
} from './constants';
import { LeftNavMenu } from './LeftNavMenu';
import { ProfileWidget } from './ProfileWidget';

const Wrapper = styled(ScrollFix)``;

const MainScrollFix = styled.div`
  padding: 0 20px 170px;
`;

const Container = styled.div`
  width: 100%;
  max-width: 796px;
  margin: 0 auto;
  padding-top: ${CONTAINER_PADDING_TOP}px;
`;

const Content = styled.div``;

const ColumnsWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: ${COLUMNS_GRID_GUTTER}px;
`;

const ColumnLeftSticky = styled(Sticky)`
  width: ${COLUMN_LEFT_WIDTH}px;
  height: fit-content;
`;

const ColumnLeft = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-rows: min-content;
`;

const ColumnRightWrapper = styled.div`
  width: ${COLUMN_RIGHT_WIDTH}px;
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

export const Layout: FunctionComponent<Props> = ({
  breadcrumb,
  leftColumn,
  rightColumn,
  centered,
  children,
}) => {
  const connected = useSelector((state: RootState) => state.wallet.connected);
  const loading = useSelector((state: RootState) => state.global.loading);

  useEffect(() => {
    if (loading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [Boolean(loading)]);

  return (
    <Wrapper>
      <Header breadcrumb={breadcrumb} />
      <MainScrollFix id="container">
        <Container>
          {connected ? (
            <Content>
              {rightColumn ? (
                <ColumnsWrapper>
                  <ColumnLeftSticky top={HEADER_HEIGHT + CONTAINER_PADDING_TOP}>
                    <ColumnLeft>
                      {leftColumn || (
                        <>
                          <ProfileWidget />
                          <LeftNavMenu />
                        </>
                      )}
                    </ColumnLeft>
                  </ColumnLeftSticky>
                  <ColumnRightWrapper>
                    <ColumnRight>{rightColumn}</ColumnRight>
                  </ColumnRightWrapper>
                </ColumnsWrapper>
              ) : // eslint-disable-next-line unicorn/no-nested-ternary
              centered ? (
                <CenteredWrapper>{centered}</CenteredWrapper>
              ) : (
                children
              )}
            </Content>
          ) : undefined}
        </Container>
      </MainScrollFix>
    </Wrapper>
  );
};
