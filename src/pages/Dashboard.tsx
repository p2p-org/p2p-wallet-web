import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { Layout } from 'components/common/Layout';
import { ActionsWidget } from 'components/pages/dashboard/ActionsWidget';
import { LatestTransactionsWidget } from 'components/pages/dashboard/LatestTransactionsWidget';
import { SendAgainWidget } from 'components/pages/dashboard/SendAgainWidget';
import { TotalBalanceWidget } from 'components/pages/dashboard/TotalBalanceWidget';
import { WalletsWidget } from 'components/pages/dashboard/WalletsWidget';

const Wrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 84px;

  margin-top: 32px;
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

export const Dashboard: FunctionComponent = () => {
  return (
    <Layout
      leftColumn={
        <>
          <HelloText>Good evening, Konstantin!</HelloText>
          <BalanceGroup>
            <TotalBalanceWidget />
            <ActionsWidget />
          </BalanceGroup>
          <WalletsWidget />
        </>
      }
      rightColumn={
        <>
          <SendAgainWidget />
          <LatestTransactionsWidget />
        </>
      }
    />
  );
};
