import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';

import { Layout } from 'components/common/Layout';
import { TokensWidget } from 'components/pages/wallets';
// import { ActionsWidget } from 'components/pages/wallets/ActionsWidget';
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

export const Wallets: FunctionComponent = () => {
  // const publicKey = useSelector((state: RootState) => state.data.blockchain.account?.publicKey);

  return (
    <Layout
      rightColumn={
        <WrapperTemp>
          <TotalBalanceWidget />
          {/* <ActionsWidget publicKey={publicKey} /> */}
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
