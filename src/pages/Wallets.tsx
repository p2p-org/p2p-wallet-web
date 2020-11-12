import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { Layout } from 'components/common/Layout';
import { ActionsWidget } from 'components/pages/wallets/ActionsWidget';
// import { LatestTransactionsWidget } from 'components/pages/wallets/LatestTransactionsWidget';
import { SendAgainWidget } from 'components/pages/wallets/SendAgainWidget';
import { TotalBalanceWidget } from 'components/pages/wallets/TotalBalanceWidget';
import { WalletsWidget } from 'components/pages/wallets/WalletsWidget';

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

export const Wallets: FunctionComponent = () => {
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
          {/* <LatestTransactionsWidget /> */}
        </>
      }
    />
  );
};
