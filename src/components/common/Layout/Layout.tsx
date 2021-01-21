import React, { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import NProgress from 'nprogress';

import { RootState } from 'store/rootReducer';

import { Header } from '../Header';
import { ScrollFix } from '../ScollFix';
import { Breadcrumbs, BreadcrumbType } from './Breadcrumbs';
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
  padding-top: 16px;
`;

const Content = styled.div``;

const ColumnsWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 20px;
`;

const ColumnLeft = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-rows: min-content;

  width: 252px;
  height: fit-content;
`;

const ColumnRight = styled.div`
  display: grid;
  grid-gap: 24px;
  grid-template-rows: min-content;

  width: 524px;
  height: fit-content;
`;

const CenteredWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

NProgress.configure({ showSpinner: false, parent: '#container' });

type Props = {
  breadcrumbs?: BreadcrumbType[];
  leftColumn?: React.ReactNode;
  rightColumn?: React.ReactNode;
  centered?: React.ReactNode;
};

export const Layout: FunctionComponent<Props> = ({
  breadcrumbs,
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
      <Header />
      <MainScrollFix id="container">
        <Container>
          {breadcrumbs ? <Breadcrumbs breadcrumbs={breadcrumbs} /> : undefined}
          {connected ? (
            <Content>
              {rightColumn ? (
                <ColumnsWrapper>
                  <ColumnLeft>
                    {leftColumn || (
                      <>
                        <ProfileWidget />
                        <LeftNavMenu />
                      </>
                    )}
                  </ColumnLeft>
                  <ColumnRight>{rightColumn}</ColumnRight>
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
