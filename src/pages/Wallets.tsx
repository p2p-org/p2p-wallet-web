import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { styled } from 'linaria/react';

import { Layout } from 'components/common/Layout';
import { TokensWidget } from 'components/pages/wallets';
import { ActionsWidget } from 'components/pages/wallets/ActionsWidget';
// import { LatestTransactionsWidget } from 'components/pages/wallets/LatestTransactionsWidget';
// import { SendAgainWidget } from 'components/pages/wallets/SendAgainWidget';
import { TotalBalanceWidget } from 'components/pages/wallets/TotalBalanceWidget';

const WrapperTemp = styled.div`
  display: grid;
  grid-gap: 32px;
  grid-template-rows: min-content;

  width: 100%;
  max-width: 556px;
  height: fit-content;
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

export const Wallets: FunctionComponent = () => {
  // const publicKey = useSelector((state: RootState) => state.data.blockchain.account?.publicKey);

  const greeting = useMemo(() => {
    let dayTime = '';
    const data = [
      [22, 'night'],
      [18, 'evening'],
      [12, 'afternoon'],
      [5, 'morning'],
      [0, 'night'],
    ];

    const hours = new Date().getHours();
    for (const [hour, message] of data) {
      if (hours >= hour) {
        dayTime = message;
        break;
      }
    }

    return `Good ${dayTime}`;
  }, [new Date().getHours()]);

  return (
    <Layout
      // leftColumn={
      centered={
        <WrapperTemp>
          {/* <HelloText>{greeting}, Konstantin!</HelloText> */}
          <HelloText>{greeting}!</HelloText>
          <BalanceGroup>
            {/* <TotalBalanceWidget /> */}
            {/* <ActionsWidget publicKey={publicKey} /> */}
          </BalanceGroup>
          <TokensWidget />
        </WrapperTemp>
      }
      // rightColumn={
      //   <>
      //     <SendAgainWidget />
      //     {/* <LatestTransactionsWidget /> */}
      //   </>
      // }
    />
  );
};
