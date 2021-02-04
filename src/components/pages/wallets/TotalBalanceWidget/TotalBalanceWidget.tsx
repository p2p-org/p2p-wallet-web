import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

// import ReactHighcharts from 'react-highcharts';
import { styled } from '@linaria/react';
import { Decimal } from 'decimal.js';

import { TokenAccount } from 'api/token/TokenAccount';
import { Widget } from 'components/common/Widget';
import { RootState } from 'store/rootReducer';
import { rateSelector } from 'store/selectors/rates';

// import { calculateInterval, calculateStart } from 'utils/charts';
//
// import { serials } from './data';
// import { getConfig } from './utils';

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

// const ChartWrapper = styled.div`
//   width: 254px;
// `;

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
          return new Decimal(tokenAccount.mint.toMajorDenomination(tokenAccount.balance))
            .times(rate)
            .plus(prev)
            .toNumber();
        }

        // Same as USD
        if (tokenAccount.mint.symbol && ['USDT', 'USDC'].includes(tokenAccount.mint.symbol)) {
          return new Decimal(tokenAccount.mint.toMajorDenomination(tokenAccount.balance))
            .plus(prev)
            .toNumber();
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

  // const coin = 'BTC';
  // const currency = 'BTC';
  // const time = 'day';
  //
  // const data = serials.map((d) => [d.timestamp * 1000, d.price]);
  // const decimals = 2;
  // const start = calculateStart(coin, time);
  // const interval = calculateInterval(time);
  // const config = getConfig(coin, currency, data, decimals, interval, start);

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
        {/* <ChartWrapper> */}
        {/*  <ReactHighcharts config={config} isPureConfig /> */}
        {/* </ChartWrapper> */}
      </TotalWrapper>
    </WrapperWidget>
  );
};
