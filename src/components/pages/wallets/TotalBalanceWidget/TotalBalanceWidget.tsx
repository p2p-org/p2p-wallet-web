import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import { TokenAccount } from 'api/token/TokenAccount';
import { LoaderBlock } from 'components/common/LoaderBlock';
import { Widget } from 'components/common/Widget';
import { RootState } from 'store/rootReducer';
import { rateSelector } from 'store/selectors/rates';

import { DonutChart, DonutChartData } from '../DonutChart';

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

export const TotalBalanceWidget: FunctionComponent = () => {
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const state = useSelector((currentState: RootState) => currentState);

  const totalBalance = useMemo(
    () =>
      // eslint-disable-next-line unicorn/no-reduce
      tokenAccounts.reduce((prev, tokenAccount) => {
        const rate = rateSelector(tokenAccount.mint.symbol)(state);
        if (rate) {
          return tokenAccount.mint
            .toMajorDenomination(tokenAccount.balance)
            .times(rate)
            .plus(prev)
            .toNumber();
        }

        // Same as USD
        if (tokenAccount.mint.symbol) {
          return tokenAccount.mint.toMajorDenomination(tokenAccount.balance).plus(prev).toNumber();
        }

        return prev;
      }, 0),
    [tokenAccounts, state.rate.markets],
  );

  const greeting = useMemo(() => {
    let dayTime = '';
    const data = [
      [22, 'night'],
      [18, 'evening'],
      [12, 'afternoon'],
      [5, 'morning'],
      [0, 'night'],
    ] as [number, string][];

    const hours = new Date().getHours();
    for (const [hour, message] of data) {
      if (hours >= hour) {
        dayTime = message;
        break;
      }
    }

    return `Good ${dayTime}!`;
  }, [new Date().getHours()]);

  const donutData = useMemo(() => {
    const data: DonutChartData = [];

    tokenAccounts.forEach((tokenAccount) => {
      if (!tokenAccount.mint.symbol || tokenAccount.balance.lte(0)) {
        return;
      }

      const rate = rateSelector(tokenAccount.mint.symbol)(state);

      if (!rate) {
        return;
      }

      const balance = tokenAccount.mint
        .toMajorDenomination(tokenAccount.balance)
        .times(rate)
        .toNumber();
      const balanceUSD = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(balance);

      data.push({
        label: `${tokenAccount.mint.symbol} ${balanceUSD}`,
        value: balance,
        color: tokenAccount.mint.color,
      });
    });

    return data;
  }, [tokenAccounts]);

  return (
    <WrapperWidget title={`${greeting} 👋`}>
      <TotalWrapper>
        <PriceWrapper>
          <TotalText>Total balance</TotalText>
          <Price>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              totalBalance,
            )}
          </Price>
          <AllTokensText>All tokens</AllTokensText>
        </PriceWrapper>
        <ChartWrapper>
          {tokenAccounts.length === 0 ? (
            <LoaderBlock />
          ) : (
            <DonutChart size={CHART_SIZE} data={donutData} />
          )}
        </ChartWrapper>
      </TotalWrapper>
    </WrapperWidget>
  );
};
