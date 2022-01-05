import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';
import ReactHighcharts from 'react-highcharts';

import { styled } from '@linaria/react';
import { useTokenAccount } from '@p2p-wallet-web/core';
import type web3 from '@solana/web3.js';
import classNames from 'classnames';

import type { CandleLimitType } from 'app/contexts';
import { useRates } from 'app/contexts';
import { ToastManager } from 'components/common/ToastManager';

// import dayjs from 'dayjs';
// import { rgba } from 'polished';
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
  const [isLoading, setIsLoading] = useState(false);
  const tokenAccount = useTokenAccount(publicKey);
  const { candlesType, candles, getRatesCandle, changeCandlesType } = useRates();
  const rates = tokenAccount?.balance?.token.symbol
    ? candles[tokenAccount.balance.token.symbol]
    : undefined;

  const loadCandles = async (nextType: CandleLimitType) => {
    if (isLoading || !tokenAccount?.balance?.token.symbol) {
      return;
    }

    try {
      setIsLoading(true);
      await getRatesCandle(tokenAccount?.balance.token.symbol, nextType);
    } catch (err) {
      ToastManager.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCandles(candlesType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenAccount?.balance?.token.symbol, candlesType]);

  if (!tokenAccount || !rates || rates.length === 0) {
    return null;
  }

  const handleFilterClick = (nextType: CandleLimitType) => () => {
    changeCandlesType(nextType);
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
          className={classNames({ active: candlesType === 'last1h' })}
          onClick={handleFilterClick('last1h')}
        >
          1H
        </FilterButton>
        <FilterButton
          className={classNames({ active: candlesType === 'last4h' })}
          onClick={handleFilterClick('last4h')}
        >
          4H
        </FilterButton>
        <FilterButton
          className={classNames({ active: candlesType === 'day' })}
          onClick={handleFilterClick('day')}
        >
          1D
        </FilterButton>
        <FilterButton
          className={classNames({ active: candlesType === 'week' })}
          onClick={handleFilterClick('week')}
        >
          1W
        </FilterButton>
        <FilterButton
          className={classNames({ active: candlesType === 'month' })}
          onClick={handleFilterClick('month')}
        >
          1M
        </FilterButton>
      </BottomWrapper>
    </Wrapper>
  );
};
