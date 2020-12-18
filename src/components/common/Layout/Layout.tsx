import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import { RootState } from 'store/rootReducer';

import { Header } from '../Header';
import { ScrollFix } from '../ScollFix';
import { Breadcrumbs, BreadcrumbType } from './Breadcrumbs';

const Wrapper = styled(ScrollFix)``;

const MainScrollFix = styled.div`
  padding: 0 20px 170px;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1004px;
  margin: 0 auto;
  padding-top: 20px;
`;

const Content = styled.div``;

const ColumnsWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 84px;

  margin-top: 32px;
`;

const ColumnLeft = styled.div`
  display: grid;
  grid-gap: 32px;
  grid-template-rows: min-content;

  width: 556px;
  height: fit-content;
`;

const ColumnRight = styled.div`
  display: grid;
  grid-gap: 40px;
  grid-template-rows: min-content;

  width: 364px;
  height: fit-content;
`;

const CenteredWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

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

  return (
    <Wrapper>
      <Header />
      <MainScrollFix>
        <Container>
          {breadcrumbs ? <Breadcrumbs breadcrumbs={breadcrumbs} /> : undefined}
          {connected ? (
            <Content>
              {leftColumn && rightColumn ? (
                <ColumnsWrapper>
                  <ColumnLeft>{leftColumn}</ColumnLeft>
                  <ColumnRight>{rightColumn}</ColumnRight>
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
  );
};
