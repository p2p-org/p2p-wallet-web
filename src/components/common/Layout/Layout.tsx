import React, { FunctionComponent, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import Sticky from 'react-stickynode';

import { styled } from '@linaria/react';
import NProgress from 'nprogress';

import { RootState } from 'store/rootReducer';
import { updateTokenAccountsForWallet } from 'store/slices/wallet/WalletSlice';
import { useIntervalHook } from 'utils/hooks/useIntervalHook';

import { BreadcrumbType, Header } from '../Header';
import { HEADER_HEIGHT } from '../Header/constants';
import { ScrollFix } from '../ScollFix';
import {
  COLUMN_LEFT_WIDTH,
  COLUMN_RIGHT_WIDTH,
  COLUMNS_GRID_GUTTER,
  CONTAINER_PADDING_TOP,
} from './constants';
import { Download } from './Download';
import { LeftNavMenu } from './LeftNavMenu';
import { ProfileWidget } from './ProfileWidget';

const Wrapper = styled(ScrollFix)``;

const MainScrollFix = styled.div`
  padding: 0 20px 170px;
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

export const LayoutOrigin: FunctionComponent<Props> = ({
  breadcrumb,
  leftColumn,
  rightColumn,
  centered,
  children,
}) => {
  const dispatch = useDispatch();
  const connected = useSelector((state: RootState) => state.wallet.connected);
  const loading = useSelector((state: RootState) => state.global.loading);

  useEffect(() => {
    if (loading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [Boolean(loading)]);

  useIntervalHook(() => {
    void dispatch(updateTokenAccountsForWallet());
  }, 5000);

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
                  <ColumnsWrapper>
                    <ColumnLeftSticky top={HEADER_HEIGHT + CONTAINER_PADDING_TOP}>
                      <ColumnLeft>
                        {leftColumn || (
                          <>
                            <ProfileWidget />
                            <LeftNavMenu />
                            <Download />
                          </>
                        )}
                      </ColumnLeft>
                    </ColumnLeftSticky>
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
      </Wrapper>
    </>
  );
};

export const Layout = React.memo(LayoutOrigin);
