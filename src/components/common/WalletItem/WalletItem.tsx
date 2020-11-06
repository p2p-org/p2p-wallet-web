import React, { FunctionComponent } from 'react';
import ReactHighcharts from 'react-highcharts';

import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { calculateInterval, calculateStart } from 'utils/charts';

import { Card } from '../Card';
import { serials } from './data';
import { getConfig } from './utils';

const WrapperCard = styled(Card)`
  display: flex;

  cursor: pointer;
`;

const Avatar = styled.div`
  width: 56px;
  height: 56px;

  background: #c4c4c4;

  border-radius: 50%;
`;

const Content = styled.div`
  flex: 1;
  margin-left: 20px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  font-weight: 500;
  font-size: 18px;
  line-height: 140%;
`;

const ChartWrapper = styled.div`
  width: 108px;
`;

const Middle = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 12px 0 4px;

  color: #000;
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;

  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 140%;
`;

type Props = {};

export const WalletItem: FunctionComponent<Props> = ({
  name,
  balance1,
  balance2,
  value,
  delta,
}) => {
  const coin = 'BTC';
  const currency = 'BTC';
  const time = 'day';

  const data = serials.map((d) => [d.timestamp * 1000, d.price]);
  const decimals = 2;
  const start = calculateStart(coin, time);
  const interval = calculateInterval(time);
  const config = getConfig(coin, currency, data, decimals, interval, start);

  return (
    <WrapperCard>
      <Avatar />
      <Content>
        <Top>
          <div>{name}</div>
          <ChartWrapper>
            <ReactHighcharts config={config} isPureConfig />
          </ChartWrapper>
        </Top>
        <Middle>
          <div>{balance1}</div> <div>{balance2}</div>
        </Middle>
        <Bottom>
          <div>{value}</div> <div>{delta}</div>
        </Bottom>
      </Content>
    </WrapperCard>
  );
};
