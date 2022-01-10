import type { FunctionComponent } from 'react';
import { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';

import { styled } from '@linaria/react';
import { useUserTokenAccounts } from '@p2p-wallet-web/core';

import { useMarketsData } from 'app/contexts';
import { LoaderBlock } from 'components/common/LoaderBlock';
import { Widget } from 'components/common/Widget';

import type { DonutChartData } from '../DonutChart';
import { DonutChart } from '../DonutChart';
import colors from './colors.config';

const CHART_SIZE = 110;

const WrapperWidget = styled(Widget)``;

const TotalWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 20px 20px 30px;
`;

const PriceWrapper = styled.div`
  font-weight: 600;
`;

const TotalText = styled.div`
  color: #000;
  font-size: 16px;
  line-height: 24px;
`;

const Price = styled.div`
  align-self: flex-end;
  margin: 24px 0 4px;

  color: #000;
  font-size: 32px;
  line-height: 120%;
`;

const AllTokensText = styled.div`
  color: #a3a5ba;
  font-size: 14px;
  line-height: 140%;
`;

const ChartWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${CHART_SIZE}px;
  height: ${CHART_SIZE}px;
`;

type Props = {
  onSymbolChange: (symbol: string) => void;
};

export const TotalBalanceWidget: FunctionComponent<Props> = ({ onSymbolChange }) => {
  const tokenAccounts = useUserTokenAccounts();

  const symbols = useMemo(() => {
    return tokenAccounts.map((tokenAccount) => tokenAccount.balance?.token.symbol);
  }, [tokenAccounts]);

  const markets = useMarketsData(symbols);

  const totalBalance = useMemo(
    () =>
      tokenAccounts.reduce((prev, tokenAccount) => {
        if (!tokenAccount?.balance?.token.symbol) {
          return prev;
        }

        const rate = markets[tokenAccount?.balance?.token.symbol];
        if (rate) {
          return tokenAccount.balance.asNumber * rate + prev;
        }

        // Same as USD
        return tokenAccount.balance.asNumber + prev;
      }, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokenAccounts, markets],
  );

  const hours = new Date().getHours();
  const greeting = useMemo(() => {
    let dayTime = '';
    const data = [
      [22, 'night'],
      [18, 'evening'],
      [12, 'afternoon'],
      [5, 'morning'],
      [0, 'night'],
    ] as [number, string][];

    for (const [hour, message] of data) {
      if (hours >= hour) {
        dayTime = message;
        break;
      }
    }

    return `Good ${dayTime}!`;
  }, [hours]);

  const donutData = useMemo(() => {
    const data: DonutChartData = [];

    tokenAccounts.forEach((tokenAccount) => {
      if (!tokenAccount.balance?.token.symbol || tokenAccount.balance.toU64().lten(0)) {
        return;
      }

      const rate = markets[tokenAccount.balance.token.symbol];
      if (!rate) {
        return;
      }

      const balance = tokenAccount.balance.asNumber * rate;
      const balanceUSD = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(balance);

      data.push({
        symbol: tokenAccount.balance.token.symbol,
        amount: balance,
        amountUSD: balanceUSD,
        color: colors[tokenAccount.balance.token.symbol],
      });
    });

    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenAccounts]);

  const isLoading = useMemo(() => {
    return tokenAccounts.some((tokenAccount) => tokenAccount.loading);
  }, [tokenAccounts]);

  return (
    <WrapperWidget title={`${greeting} 👋`}>
      <TotalWrapper>
        <PriceWrapper>
          <TotalText>Total balance</TotalText>
          <Price>
            {isLoading ? (
              <Skeleton width={100} height={30} />
            ) : (
              new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                totalBalance,
              )
            )}
          </Price>
          <AllTokensText>All tokens</AllTokensText>
        </PriceWrapper>
        <ChartWrapper>
          {isLoading ? (
            <LoaderBlock />
          ) : (
            <DonutChart size={CHART_SIZE} data={donutData} onSymbolChange={onSymbolChange} />
          )}
        </ChartWrapper>
      </TotalWrapper>
    </WrapperWidget>
  );
};
