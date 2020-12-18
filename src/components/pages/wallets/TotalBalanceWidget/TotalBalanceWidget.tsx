import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

// import ReactHighcharts from 'react-highcharts';
import { styled } from '@linaria/react';
import * as web3 from '@solana/web3.js';
import { Decimal } from 'decimal.js';
import { rgba } from 'polished';

import tokenConfig from 'api/token/token.config';
import { TokenAccount } from 'api/token/TokenAccount';
import { Card } from 'components/common/Card';
import { RootState } from 'store/rootReducer';
// import { calculateInterval, calculateStart } from 'utils/charts';
//
// import { serials } from './data';
// import { getConfig } from './utils';

const WrapperCard = styled(Card)``;

const Title = styled.div`
  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 140%;
`;

const PriceWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Price = styled.div`
  align-self: flex-end;

  color: #000;
  font-weight: 500;
  font-size: 34px;
  line-height: 120%;
`;

// const ChartWrapper = styled.div`
//   width: 254px;
// `;
//
// const Delta = styled.div`
//   margin-top: 9px;
//
//   color: ${rgba('#000', 0.5)};
//   font-size: 14px;
//   line-height: 140%;
// `;

export const TotalBalanceWidget: FunctionComponent = () => {
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const rates = useSelector((state: RootState) => state.rate);

  const totalBalance = useMemo(
    () =>
      // eslint-disable-next-line unicorn/no-reduce
      tokenAccounts.reduce((prev, tokenAccount) => {
        const rate = rates.markets[`${tokenAccount.mint.symbol}/USDT`];
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
    [tokenAccounts, rates],
  );

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
    <WrapperCard withShadow>
      <Title>Total balance</Title>
      <PriceWrapper>
        <Price>
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
            totalBalance,
          )}
        </Price>
        {/* <ChartWrapper> */}
        {/*  <ReactHighcharts config={config} isPureConfig /> */}
        {/* </ChartWrapper> */}
      </PriceWrapper>
      {/* <Delta>+ 0,16 US$ (0,01%) 24 hrs</Delta> */}
    </WrapperCard>
  );
};
