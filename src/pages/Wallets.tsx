import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';

import { Layout } from 'components/common/Layout';
import { TokensWidget } from 'components/pages/wallets';
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
  return (
    <Layout
      rightColumn={
        <WrapperTemp>
          <TotalBalanceWidget />
          <TokensWidget />
        </WrapperTemp>
      }
    />
  );
};
