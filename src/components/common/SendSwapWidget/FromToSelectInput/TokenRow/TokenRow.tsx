import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import * as web3 from '@solana/web3.js';
import { rgba } from 'polished';

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
  publicKey: string;
  onClick: (publicKey: string) => void;
};

export const TokenRow: FunctionComponent<Props> = ({ publicKey, onClick }) => {
  const { name, mint, symbol, amount } = useTokenInfo(publicKey);

  const handleClick = () => {
    onClick(publicKey);
  };

  return (
    <Wrapper onClick={handleClick}>
      <ItemWrapper>
        <TokenAvatar mint={mint} size={44} includeSol />
        <Info>
          <Top>
            <TokenName title={publicKey}>{name || publicKey}</TokenName> <div>{amount}</div>
          </Top>
          <Bottom>
            <div>{symbol}</div> <div>Current balance</div>
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
