import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { TokenAccount } from 'api/token/TokenAccount';
import { TokenAvatar } from 'components/common/TokenAvatar';

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
  tokenAccount: TokenAccount;
  onClick: (tokenAccount: TokenAccount) => void;
};

export const TokenRow: FunctionComponent<Props> = ({ tokenAccount, onClick }) => {
  const handleClick = () => {
    onClick(tokenAccount);
  };

  return (
    <Wrapper onClick={handleClick}>
      <ItemWrapper>
        <TokenAvatar symbol={tokenAccount.mint.symbol} size={44} />
        <Info>
          <Top>
            <TokenName title={tokenAccount.address.toBase58()}>
              {tokenAccount.mint.name || tokenAccount.address.toBase58()}
            </TokenName>
            <div>{tokenAccount.mint.toMajorDenomination(tokenAccount.balance)}</div>
          </Top>
          <Bottom>
            <div>{tokenAccount.mint.symbol}</div> <div>Current balance</div>
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
