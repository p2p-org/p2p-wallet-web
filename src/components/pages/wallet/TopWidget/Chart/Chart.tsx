import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import ReactHighcharts from 'react-highcharts';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import web3 from '@solana/web3.js';
import classNames from 'classnames';

import { CandleLimitType } from 'api/rate/CandleRate';
// import dayjs from 'dayjs';
// import { rgba } from 'polished';
import { TokenAccount } from 'api/token/TokenAccount';
import { changeCandlesType, getRatesCandle } from 'store/slices/rate/RateSlice';

// import { calculateInterval, calculateStart } from 'utils/charts';
import { getConfig } from './utils';

const Wrapper = styled.div`
  position: relative;
`;

const ChartWrapper = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const BottomWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  height: 54px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 51px;
  height: 34px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 13px;
  line-height: 20px;

  background: transparent;
  border: 0;
  outline: none;
  cursor: pointer;

  appearance: none;

  &:not(:last-child) {
    margin-right: 20px;
  }

  &.active {
    color: #000;

    background: #f6f6f8;
    border-radius: 12px;
  }
`;

// const TopWrapper = styled.div`
//   padding: 0 16px 20px;
// `;

// const BalanceValue = styled.div`
//   color: #000;
//   font-weight: 500;
//   font-size: 22px;
//   line-height: 26px;
// `;

// const DeltaValue = styled.div`
//   margin-top: 9px;
//
//   color: ${rgba('#000', 0.5)};
//   font-size: 14px;
//   line-height: 17px;
// `;

type Props = {
  publicKey: web3.PublicKey;
};

export const Chart: FunctionComponent<Props> = ({ publicKey }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const type = useSelector((state) => state.rate.candlesType);
  const tokenAccounts = useSelector((state) => state.wallet.tokenAccounts);
  const tokenAccount = useMemo(() => {
    const foundToken = tokenAccounts.find((account) => account.address === publicKey.toBase58());
    return foundToken && TokenAccount.from(foundToken);
  }, [tokenAccounts, publicKey]);
  const rates = useSelector((state) =>
    tokenAccount?.mint.symbol ? state.rate.candles[tokenAccount?.mint.symbol] : undefined,
  );

  const loadCandles = async (nextType: CandleLimitType) => {
    if (isLoading || !tokenAccount?.mint.symbol) {
      return;
    }

    setIsLoading(true);
    await dispatch(getRatesCandle({ symbol: tokenAccount.mint.symbol, type: nextType }));
    setIsLoading(false);
  };

  useEffect(() => {
    void loadCandles(type);
  }, [tokenAccount?.mint.symbol, type]);

  if (!tokenAccount || !rates || rates.length === 0) {
    return null;
  }

  const handleFilterClick = (nextType: CandleLimitType) => () => {
    dispatch(changeCandlesType(nextType));
  };

  const data = rates.map((rate) => [rate.startTime, rate.price]);
  const config = getConfig(data);

  // const diff = rates[rates.length - 1].price - rates[rates.length - 2].price;
  // const sum = rates[rates.length - 1].price + rates[rates.length - 2].price;
  // const percentage = 100 * (diff / (sum / 2));

  return (
    <Wrapper>
      {/* <TopWrapper> */}
      {/* <BalanceValue> */}
      {/*  {tokenAccount.mint.toMajorDenomination(tokenAccount.balance)} {tokenAccount.mint.symbol} */}
      {/* </BalanceValue> */}
      {/* <DeltaValue> */}
      {/*  {diff.toFixed(2)} USD ({percentage.toFixed(2)}%){' '} */}
      {/*  {dayjs.unix(rates[rates.length - 1].startTime).format('LL')} */}
      {/* </DeltaValue> */}
      {/* </TopWrapper> */}
      <ChartWrapper>
        <ReactHighcharts config={config} isPureConfig />
      </ChartWrapper>
      <BottomWrapper>
        <FilterButton
          className={classNames({ active: type === 'last1h' })}
          onClick={handleFilterClick('last1h')}>
          1H
        </FilterButton>
        <FilterButton
          className={classNames({ active: type === 'last4h' })}
          onClick={handleFilterClick('last4h')}>
          4H
        </FilterButton>
        <FilterButton
          className={classNames({ active: type === 'day' })}
          onClick={handleFilterClick('day')}>
          1D
        </FilterButton>
        <FilterButton
          className={classNames({ active: type === 'week' })}
          onClick={handleFilterClick('week')}>
          1W
        </FilterButton>
        <FilterButton
          className={classNames({ active: type === 'month' })}
          onClick={handleFilterClick('month')}>
          1M
        </FilterButton>
      </BottomWrapper>
    </Wrapper>
  );
};
