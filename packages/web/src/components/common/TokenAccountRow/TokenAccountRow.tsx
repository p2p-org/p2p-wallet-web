import type { FunctionComponent } from 'react';
import React from 'react';

import { styled } from '@linaria/react';

import type { TokenAccount } from 'api/token/TokenAccount';
import { AmountUSD } from 'components/common/AmountUSD';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { formatAccountBalance } from 'utils/amount';
import { shortAddress } from 'utils/tokens';

const Wrapper = styled.div`
  padding: 10px 20px;

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
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;
`;

const TokenSymbol = styled.div`
  max-width: 300px;

  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

type Props = {
  tokenAccount: TokenAccount;
  onClick?: (tokenAccount: TokenAccount) => void;
  className?: string;
};

export const TokenAccountRow: FunctionComponent<Props> = ({ tokenAccount, onClick, className }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(tokenAccount);
    }
  };

  return (
    <Wrapper onClick={handleClick} className={className}>
      <ItemWrapper>
        <TokenAvatar
          symbol={tokenAccount.mint.symbol}
          address={tokenAccount.mint.address.toBase58()}
          size={44}
        />
        <Info>
          <Top>
            <TokenSymbol title={tokenAccount.mint.address.toBase58()}>
              {tokenAccount.mint.symbol || shortAddress(tokenAccount.mint.address.toBase58())}
            </TokenSymbol>
            <AmountUSD
              symbol={tokenAccount.mint.symbol}
              value={tokenAccount.mint.toMajorDenomination(tokenAccount.balance)}
            />
          </Top>
          <Bottom>
            <div>{tokenAccount.mint.name}</div>
            <div>
              {formatAccountBalance(tokenAccount)} {tokenAccount.mint.symbol}
            </div>
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
