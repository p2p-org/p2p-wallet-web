import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { RateUSDT } from 'components/common/RateUSDT';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { useTokenInfo } from 'utils/hooks/useTokenInfo';

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
  publicKey: string;
  onItemClick: (publicKey: string) => void;
};

export const TokenRow: FunctionComponent<Props> = ({ publicKey, onItemClick }) => {
  const { name, mint, symbol, amount } = useTokenInfo(publicKey);

  const handleClick = () => {
    onItemClick(publicKey);
  };

  return (
    <Wrapper title={publicKey} onClick={handleClick}>
      <ItemWrapper>
        <TokenAvatar mint={mint} size={32} includeSol />
        <Info>
          <Top>
            <TokenName>{name || publicKey}</TokenName> <RateUSDT symbol={symbol} />
          </Top>
          <Bottom>
            <div>{symbol}</div>{' '}
            <div>
              {amount} {symbol}
            </div>
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
