import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { Layout } from 'components/common/Layout';
import { ActionsWidget } from 'components/dashboard/ActionsWidget';
import { LatestTransactionsWidget } from 'components/dashboard/LatestTransactionsWidget';
import { SendAgainWidget } from 'components/dashboard/SendAgainWidget';
import { TotalBalanceWidget } from 'components/dashboard/TotalBalanceWidget';
import { WalletsWidget } from 'components/dashboard/WalletsWidget';

const Wrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 84px;

  margin-top: 32px;
`;

const ColumnLeft = styled.div`
  display: grid;
  grid-gap: 32px;
  grid-template-rows: min-content;

  height: fit-content;
  width: 100%;
  max-width: 556px;
`;

const HelloText = styled.div`
  color: #000;
  font-weight: 500;
  font-size: 27px;
  line-height: 120%;
`;

const BalanceGroup = styled.div`
  display: grid;
  grid-gap: 20px;
`;

const ColumnRight = styled.div`
  display: grid;
  grid-gap: 40px;
  grid-template-rows: min-content;

  height: fit-content;
  width: 100%;
  max-width: 364px;
`;

export const Dashboard: FunctionComponent = () => {
  return (
    <Layout>
      <Wrapper>
        <ColumnLeft>
          <HelloText>Good evening, Konstantin!</HelloText>
          <BalanceGroup>
            <TotalBalanceWidget />
            <ActionsWidget />
          </BalanceGroup>
          <WalletsWidget />
        </ColumnLeft>
        <ColumnRight>
          <SendAgainWidget />
          <LatestTransactionsWidget />
        </ColumnRight>
      </Wrapper>
    </Layout>
  );
};
