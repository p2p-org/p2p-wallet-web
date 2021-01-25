import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import ReactHighcharts from 'react-highcharts';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import web3 from '@solana/web3.js';
import dayjs from 'dayjs';
import { rgba } from 'polished';

import { TokenAccount } from 'api/token/TokenAccount';
import { Card } from 'components/common/Card';
import { RootState } from 'store/rootReducer';
import { getRatesCandle } from 'store/slices/rate/RateSlice';

// import { calculateInterval, calculateStart } from 'utils/charts';
import { getConfig } from './utils';

const Wrapper = styled(Card)`
  position: relative;

  padding-right: 0;
  padding-left: 0;
  overflow: hidden;
`;

const TopWrapper = styled.div`
  padding: 0 16px 20px;
`;

const BalanceValue = styled.div`
  color: #000;
  font-weight: 500;
  font-size: 22px;
  line-height: 26px;
`;

const DeltaValue = styled.div`
  margin-top: 9px;

  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 17px;
`;

type Props = {
  publicKey: web3.PublicKey;
};

export const PriceWidget: FunctionComponent<Props> = ({ publicKey }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const tokenAccounts = useSelector((state: RootState) => state.wallet.tokenAccounts);
  const tokenAccount = useMemo(() => {
    const foundToken = tokenAccounts.find((account) => account.address === publicKey.toBase58());
    return foundToken && TokenAccount.from(foundToken);
  }, [tokenAccounts, publicKey]);
  const rates = useSelector(
    (state: RootState) => state.rate.candles[`${tokenAccount?.mint.symbol}/USDT`],
  );

  useEffect(() => {
    const loadCandles = async () => {
      if (isLoading || !tokenAccount?.mint.symbol || rates) {
        return;
      }

      setIsLoading(true);
      await dispatch(getRatesCandle(tokenAccount.mint.symbol));
      setIsLoading(false);
    };

    void loadCandles();
  }, [tokenAccount?.mint.symbol]);

  if (!tokenAccount || !rates || rates.length === 0) {
    return null;
  }

  // const coin = 'BTC';
  // const currency = 'BTC';
  // const time = 'day';

  const data = rates.map((rate) => [rate.startTime, rate.price]);
  // const decimals = 2;
  // const start = calculateStart(coin, time);
  // const interval = calculateInterval(time);
  const config = getConfig(data);

  const diff = rates[rates.length - 1].price - rates[rates.length - 2].price;
  const sum = rates[rates.length - 1].price + rates[rates.length - 2].price;
  const percentage = 100 * (diff / (sum / 2));

  return (
    <Wrapper>
      <TopWrapper>
        <BalanceValue>
          {tokenAccount.mint.toMajorDenomination(tokenAccount.balance)} {tokenAccount.mint.symbol}
        </BalanceValue>
        <DeltaValue>
          {diff.toFixed(2)} USD ({percentage.toFixed(2)}%){' '}
          {dayjs(rates[rates.length - 1].startTime).format('LL')}
        </DeltaValue>
      </TopWrapper>
      <ReactHighcharts config={config} isPureConfig />
    </Wrapper>
  );
};
