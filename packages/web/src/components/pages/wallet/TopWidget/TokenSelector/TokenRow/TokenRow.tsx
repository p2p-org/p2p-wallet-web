import type { FunctionComponent } from 'react';
import React from 'react';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import type { TokenAccount } from 'api/token/TokenAccount';
import { RateUSD } from 'components/common/RateUSD';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { formatAccountBalance } from 'utils/amount';

const Wrapper = styled.div`
  padding: 15px 12px;

  cursor: pointer;
`;

const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 35px;
`;

const Info = styled.div`
  flex: 1;
  margin-left: 12px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  color: #fff;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
`;

const TokenName = styled.div`
  max-width: 300px;

  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;

  color: ${rgba('#ffff', 0.5)};
  font-size: 12px;
  line-height: 14px;
`;

type Props = {
  token: TokenAccount;
  onItemClick: (publicKey: string) => void;
};

export const TokenRow: FunctionComponent<Props> = ({ token, onItemClick }) => {
  const handleClick = () => {
    onItemClick(token.address.toBase58());
  };

  return (
    <Wrapper title={token.address.toBase58()} onClick={handleClick}>
      <ItemWrapper>
        <TokenAvatar symbol={token.mint.symbol} address={token.mint.address.toBase58()} size={32} />
        <Info>
          <Top>
            <TokenName>{token.mint.name || token.address.toBase58()}</TokenName>{' '}
            <RateUSD symbol={token.mint.symbol} />
          </Top>
          <Bottom>
            <div>{token.mint.symbol}</div>{' '}
            <div>
              {formatAccountBalance(token)} {token.mint.symbol}
            </div>
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
