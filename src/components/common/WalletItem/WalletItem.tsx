import React, { FunctionComponent } from 'react';
// import ReactHighcharts from 'react-highcharts';
import { useSelector } from 'react-redux';

import * as web3 from '@solana/web3.js';
import bs58 from 'bs58';
import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { TOKEN_PROGRAM_ID } from 'constants/solana/bufferLayouts';
import { TOKENS_BY_ENTRYPOINT } from 'constants/tokens';
import { RootState } from 'store/types';
// import { calculateInterval, calculateStart } from 'utils/charts';
import { parseTokenAccountData } from 'utils/solana/parseData';

import { Card } from '../Card';
// import { serials } from './data';
// import { getConfig } from './utils';

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

function getTokenInfo({
  mint,
  entrypoint,
}: {
  mint?: web3.PublicKey;
  entrypoint: string;
}): {
  name?: string;
  symbol?: string;
} {
  if (!mint) {
    return { name: undefined, symbol: undefined };
  }

  const match = TOKENS_BY_ENTRYPOINT[entrypoint]?.find(
    (token) => token.mintAddress === mint.toBase58(),
  );

  if (match) {
    return { name: match.tokenName, symbol: match.tokenSymbol };
  }

  return { name: undefined, symbol: undefined };
}

export const WalletItem: FunctionComponent<Props> = ({ publicKey }) => {
  const entrypoint = useSelector((state: RootState) => state.data.blockchain.entrypoint);
  const tokenAccount: web3.AccountInfo<string> = useSelector(
    (state: RootState) => state.entities.tokens.items[publicKey],
  );

  const {
    mint,
    owner,
    amount,
  }: {
    mint?: web3.PublicKey;
    owner?: web3.PublicKey;
    amount?: number;
  } = new web3.PublicKey(String(tokenAccount?.owner)).equals(TOKEN_PROGRAM_ID)
    ? parseTokenAccountData(bs58.decode(tokenAccount.data))
    : {};

  const { name, symbol } = getTokenInfo({ mint, entrypoint });

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
    </WrapperCard>
  );
};
