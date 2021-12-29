import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';

import { styled } from '@linaria/react';

import { Layout } from 'components/common/Layout';
import { TokensWidget, UsernameBanner } from 'components/pages/wallets';
import { TotalBalanceWidget } from 'components/pages/wallets/TotalBalanceWidget';
import { trackEvent } from 'utils/analytics';

const WrapperTemp = styled.div`
  display: grid;
  grid-gap: 32px;
  grid-template-rows: min-content;

  width: 100%;
  max-width: 556px;
  height: fit-content;
`;

export const Wallets: FunctionComponent = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('');

  useEffect(() => {
    trackEvent('wallets_open');
  }, []);

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  return (
    <Layout
      rightColumn={
        <WrapperTemp>
          <UsernameBanner />
          <TotalBalanceWidget onSymbolChange={handleSymbolChange} />
          <TokensWidget selectedSymbol={selectedSymbol} />
        </WrapperTemp>
      }
    />
  );
};
