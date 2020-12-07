import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import * as web3 from '@solana/web3.js';
import { rgba } from 'polished';

import { TokenAccount } from 'api/token/TokenAccount';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { useTokenInfo } from 'utils/hooks/useTokenInfo';

const Wrapper = styled.div`
  padding: 15px 32px;

  cursor: pointer;
`;

const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 44px;
`;

const Info = styled.div`
  flex: 1;
  margin-left: 20px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  color: #000;
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;
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

  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 17px;
`;

type Props = {
  token: TokenAccount;
  onClick: (publicKey: string) => void;
};

export const TokenRow: FunctionComponent<Props> = ({ token, onClick }) => {
  const handleClick = () => {
    onClick(token.address.toBase58());
  };

  return (
    <Wrapper onClick={handleClick}>
      <ItemWrapper>
        <TokenAvatar symbol={token.mint.symbol} size={44} />
        <Info>
          <Top>
            <TokenName title={token.address.toBase58()}>
              {token.mint.name || token.address.toBase58()}
            </TokenName>
            <div>{token.mint.toMajorDenomination(token.balance)}</div>
          </Top>
          <Bottom>
            <div>{token.mint.symbol}</div> <div>Current balance</div>
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
