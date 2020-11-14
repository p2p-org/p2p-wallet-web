import React, { FunctionComponent } from 'react';
// import ReactHighcharts from 'react-highcharts';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import * as web3 from '@solana/web3.js';
import { styled } from 'linaria/react';
import { rgba } from 'polished';

// import { calculateInterval, calculateStart } from 'utils/charts';
import { Card } from 'components/common/Card';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { RootState, TokenAccount } from 'store/types';
import { usePopulateTokenInfo } from 'utils/hooks/usePopulateTokenInfo';
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
  flex-direction: column;
  justify-content: center;
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

const TokenName = styled.div`
  max-width: 300px;
  overflow: hidden;

  text-overflow: ellipsis;
  white-space: nowrap;
`;

// const ChartWrapper = styled.div`
//   width: 108px;
// `;

// const Middle = styled.div`
//   display: flex;
//   justify-content: space-between;
//   margin: 12px 0 4px;
//
//   color: #000;
//   font-weight: 500;
//   font-size: 14px;
//   line-height: 140%;
// `;

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
  const tokenAccount: TokenAccount = useSelector(
    (state: RootState) => state.entities.tokens.items[publicKey],
  );
  const balanceLamports = useSelector((state: RootState) => state.data.blockchain.balanceLamports);

  // eslint-disable-next-line prefer-const
  let { mint, amount } = tokenAccount?.parsed || { amount: 0 };
  const { name } = usePopulateTokenInfo({ mint: mint?.toBase58(), includeSol: true });

  if (!mint) {
    amount = balanceLamports / web3.LAMPORTS_PER_SOL;
  }

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
      <WrapperLink to={`/wallet/${/* mint ? symbol || publicKey : */ publicKey}`}>
        {/* TODO: move to rollup because of parcel error if wrap TokenAvatar */}
        <TokenAvatar mint={mint?.toBase58()} size={56} includeSol />
        <Content>
          <Top>
            <TokenName title={publicKey}>{name || publicKey}</TokenName>
            {/* <ChartWrapper> */}
            {/*  <ReactHighcharts config={config} isPureConfig /> */}
            {/* </ChartWrapper> */}
          </Top>
          {/* <Middle><div>{balance1}</div> <div>{balance2}</div></Middle> */}
          {/* <Middle> */}
          {/*  <div>{balanceUsd}</div> /!* <div>{balance2}</div> *!/ */}
          {/* </Middle> */}
          <Bottom>
            <div>{amount}</div> {/* <div>{delta}</div> */}
          </Bottom>
        </Content>
      </WrapperLink>
    </WrapperCard>
  );
};
