import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import * as web3 from '@solana/web3.js';
// import ReactHighcharts from 'react-highcharts';
import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { Card } from 'components/common/Card';
import { SYSTEM_PROGRAM_ID, TOKEN_PROGRAM_ID } from 'constants/solana/bufferLayouts';
import { TOKENS_BY_ENTRYPOINT } from 'constants/tokens';
import { RootState } from 'store/types';
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
  const tokens = useSelector((state: RootState) => state.entities.tokens.items);
  const order = useSelector((state: RootState) => state.entities.tokens.order);
  const balanceLamports = useSelector((state: RootState) => state.data.blockchain.balanceLamports);
  const rates = useSelector((state: RootState) => state.entities.rates);
  const entrypoint = useSelector((state: RootState) => state.data.blockchain.entrypoint);
  const publicKey = useSelector((state: RootState) =>
    state.data.blockchain.account?.publicKey.toBase58(),
  );

  const preparedOrder = useMemo(() => (publicKey ? [publicKey, ...order] : order), [
    publicKey,
    order,
  ]);

  // Oh my gosh
  const totalBalance = useMemo(
    () =>
      preparedOrder
        .map((publicKey) => tokens[publicKey])
        .filter((token) => token)
        .reduce((prev, cur) => {
          const tokenPublicKey = new web3.PublicKey(String(cur.owner));

          if (tokenPublicKey.equals(TOKEN_PROGRAM_ID)) {
            const match = TOKENS_BY_ENTRYPOINT[entrypoint]?.find(
              (token) => token.mintAddress === cur.data.parsed.info.mint,
            );

            if (match) {
              const rate = rates[`${match.tokenSymbol}/USDT`];
              if (rate) {
                return prev + cur.data.parsed.info.tokenAmount.uiAmount * rate;
              }
            }
          } else if (tokenPublicKey.equals(SYSTEM_PROGRAM_ID)) {
            return prev + (cur.lamports / web3.LAMPORTS_PER_SOL) * (rates['SOL/USDT'] || 0);
          }

          return prev;
        }, 0),
    [preparedOrder, tokens, balanceLamports, rates, entrypoint],
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
