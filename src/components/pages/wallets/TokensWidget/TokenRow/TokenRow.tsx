import React, { FunctionComponent } from 'react';
// import ReactHighcharts from 'react-highcharts';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import { Decimal } from 'decimal.js';
import { rgba } from 'polished';

import { TokenAccount } from 'api/token/TokenAccount';
import { AmountUSDT } from 'components/common/AmountUSDT';
// import { calculateInterval, calculateStart } from 'utils/charts';
import { Card } from 'components/common/Card';
import { RateUSDT } from 'components/common/RateUSDT';
import { TokenAvatar } from 'components/common/TokenAvatar';
// import { serials } from './data';
// import { getConfig } from './utils';

const WrapperCard = styled(Card)`
  padding: 0 !important;
`;

const WrapperLink = styled(Link)`
  display: flex;
  padding: 20px;

  text-decoration: none;

  cursor: pointer;
`;

// const TokenAvatarStyled = styled(TokenAvatar)`
//   width: 56px;
//   height: 56px;
//
//   background: #c4c4c4;
// `;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: 20px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  font-weight: 500;
  font-size: 18px;
  line-height: 140%;
`;

const TokenName = styled.div`
  max-width: 300px;
  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

// const ChartWrapper = styled.div`
//   width: 108px;
// `;

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

type Props = {
  token: TokenAccount;
};

export const TokenRow: FunctionComponent<Props> = ({ token }) => {
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
    <WrapperCard>
      <WrapperLink to={`/wallet/${token.address.toBase58()}`}>
        <TokenAvatar symbol={token.mint.symbol} size={56} />
        <Content>
          <Top>
            <TokenName title={token.mint.address.toBase58()}>
              {token.mint.symbol || token.mint.address.toBase58()}
            </TokenName>
            {/* <ChartWrapper> */}
            {/*  <ReactHighcharts config={config} isPureConfig /> */}
            {/* </ChartWrapper> */}
          </Top>
          <Middle>
            <AmountUSDT
              value={new Decimal(token.mint.toMajorDenomination(token.balance))}
              symbol={token.mint.symbol}
            />
            <RateUSDT symbol={token.mint.symbol} />
          </Middle>
          <Bottom>
            <div>
              {token.mint.toMajorDenomination(token.balance)} {token.mint.symbol}
            </div>
            {/* <div>{delta}</div> */}
          </Bottom>
        </Content>
      </WrapperLink>
    </WrapperCard>
  );
};
