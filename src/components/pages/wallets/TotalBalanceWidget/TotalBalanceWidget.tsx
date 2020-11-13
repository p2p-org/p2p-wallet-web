import React, { FunctionComponent } from 'react';

// import ReactHighcharts from 'react-highcharts';
import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { Card } from 'components/common/Card';
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

const ChartWrapper = styled.div`
  width: 254px;
`;

const Delta = styled.div`
  margin-top: 9px;

  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 140%;
`;

type Props = {};

export const TotalBalanceWidget: FunctionComponent<Props> = (props) => {
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
        <Price>$ 12 300,00</Price>
        {/* <ChartWrapper> */}
        {/*  <ReactHighcharts config={config} isPureConfig /> */}
        {/* </ChartWrapper> */}
      </PriceWrapper>
      <Delta>+ 0,16 US$ (0,01%) 24 hrs</Delta>
    </WrapperCard>
  );
};
