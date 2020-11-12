import React, { FunctionComponent } from 'react';
// import ReactHighcharts from 'react-highcharts';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { RootState, TokenAccount } from 'store/types';
import { populateTokenInfo } from 'utils/tokens';

// import { calculateInterval, calculateStart } from 'utils/charts';
import { Card } from '../../../../common/Card';
// import { serials } from './data';
// import { getConfig } from './utils';

const WrapperCard = styled(Card)`
  padding: 0;
`;

const WrapperLink = styled(Link)`
  display: flex;
  padding: 20px;

  text-decoration: none;
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
  publicKey: string;
};

export const TokenRow: FunctionComponent<Props> = ({ publicKey }) => {
  const entrypoint = useSelector((state: RootState) => state.data.blockchain.entrypoint);
  const tokenAccount: TokenAccount = useSelector(
    (state: RootState) => state.entities.tokens.items[publicKey],
  );

  const { mint, owner, amount } = tokenAccount.parsed;
  const { name, symbol } = populateTokenInfo({ mint, entrypoint });

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
      <WrapperLink to={`/wallet/${symbol || mint?.toBase58()}`}>
        <Avatar />
        <Content>
          <Top>
            <div>{name}</div>
            {/* <ChartWrapper> */}
            {/*  <ReactHighcharts config={config} isPureConfig /> */}
            {/* </ChartWrapper> */}
          </Top>
          {/* <Middle><div>{balance1}</div> <div>{balance2}</div></Middle> */}
          <Middle>
            <div>{mint?.toBase58()}</div> {/* <div>{balance2}</div> */}
          </Middle>
          <Bottom>
            <div>{amount}</div> {/* <div>{delta}</div> */}
          </Bottom>
        </Content>
      </WrapperLink>
    </WrapperCard>
  );
};
