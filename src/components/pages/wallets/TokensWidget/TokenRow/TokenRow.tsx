import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { Decimal } from 'decimal.js';
import { rgba } from 'polished';

import { TokenAccount } from 'api/token/TokenAccount';
import { AmountUSD } from 'components/common/AmountUSD';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { shortAddress } from 'utils/tokens';

const Wrapper = styled.div`
  position: relative;

  padding: 10px 0;

  &.isHidden {
    opacity: 0.5;

    &:hover {
      opacity: 1;
    }
  }

  &:not(:last-child) {
    &::after {
      position: absolute;
      right: 10px;
      bottom: 0;
      left: 10px;

      border-bottom: 1px solid ${rgba(0, 0, 0, 0.05)};

      content: '';
    }
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: 20px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  color: #000;
  font-weight: 600;
  font-size: 18px;
  line-height: 27px;
`;

const TokenName = styled.div`
  max-width: 300px;
  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const TokenAvatarStyled = styled(TokenAvatar)``;

const WrapperLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 10px;

  text-decoration: none;

  cursor: pointer;

  &:hover {
    background: #f6f6f8;
    border-radius: 12px;

    ${TokenAvatarStyled} {
      background: #fff;
    }

    ${TokenName} {
      color: #5887ff;
    }
  }
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

type Props = {
  token: TokenAccount;
  isHidden?: boolean;
};

export const TokenRow: FunctionComponent<Props> = ({ token, isHidden = false }) => {
  return (
    <Wrapper className={classNames({ isHidden })}>
      <WrapperLink to={`/wallet/${token.address.toBase58()}`}>
        <TokenAvatarStyled symbol={token.mint.symbol} size={48} />
        <Content>
          <Top>
            <TokenName title={token.mint.address.toBase58()}>
              {token.mint.symbol || shortAddress(token.mint.address.toBase58())}
            </TokenName>
            <AmountUSD
              value={new Decimal(token.mint.toMajorDenomination(token.balance))}
              symbol={token.mint.symbol}
            />
          </Top>
          <Bottom>
            <div title={token.address.toBase58()}>{shortAddress(token.address.toBase58())}</div>
            <div>
              {token.mint.toMajorDenomination(token.balance)} {token.mint.symbol}
            </div>
          </Bottom>
        </Content>
      </WrapperLink>
    </Wrapper>
  );
};
