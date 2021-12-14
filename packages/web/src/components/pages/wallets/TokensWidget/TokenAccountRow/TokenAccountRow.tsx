import type { FunctionComponent } from 'react';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { NATIVE_MINT } from '@saberhq/token-utils';
import classNames from 'classnames';
import { rgba } from 'polished';

import { useSettings } from 'app/contexts/settings';
import { AmountUSD } from 'components/common/AmountUSD';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Menu } from 'components/ui';
import { MenuItem } from 'components/ui/Menu/MenuItem';
import { shortAddress } from 'utils/tokens';

const Content = styled.div`
  position: relative;

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

const TokenSymbol = styled.div`
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

  border-radius: 12px;
  cursor: pointer;
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

const MenuWrapper = styled.div`
  position: absolute;

  top: 30%;
  right: -45px;

  padding-left: 15px;

  opacity: 0;
`;

const Wrapper = styled.div`
  position: relative;

  padding: 10px 0;

  &.isHidden {
    opacity: 0.5;

    &:hover {
      opacity: 1;
    }
  }

  &.isSelected {
    ${WrapperLink} {
      background: #eff3ff;
    }
  }

  &:hover {
    ${MenuWrapper} {
      opacity: 1;
    }

    ${WrapperLink} {
      background: #f6f6f8;
    }

    ${TokenAvatarStyled} {
      background: #fff;
    }

    ${TokenSymbol} {
      color: #5887ff;
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

type Props = {
  tokenAccount: TokenAccount;
  isSelected: boolean;
  isZeroBalancesHidden?: boolean;
  isHidden?: boolean;
};

export const TokenAccountRow: FunctionComponent<Props> = ({
  tokenAccount,
  isSelected = false,
  isHidden = false,
}) => {
  const { toggleHideTokenAccount } = useSettings();

  const handleMenuItemClick = () => {
    const tokenAddress = tokenAccount.key.toBase58();
    const isZero = !tokenAccount.balance || tokenAccount.balance.equalTo(0);
    toggleHideTokenAccount(tokenAddress, isZero);
  };

  const isSOL = tokenAccount.mint && tokenAccount.mint.equals(NATIVE_MINT);

  // TODO: refactor
  const renderTokenName = () => {
    if (isSOL) {
      return 'Solana';
    }

    return tokenAccount?.balance?.token.name;
  };

  const { loading } = tokenAccount;

  return (
    <Wrapper className={classNames({ isHidden, isSelected })}>
      <WrapperLink to={`/wallet/${tokenAccount.key.toBase58()}`}>
        {loading ? (
          <Skeleton height={48} width={48} borderRadius={12} />
        ) : (
          <TokenAvatarStyled
            symbol={tokenAccount?.balance?.token.symbol}
            address={tokenAccount?.mint?.toBase58()}
            size={48}
          />
        )}
        <Content>
          <Top>
            <TokenSymbol title={tokenAccount.mint?.toBase58()}>
              {loading ? (
                <Skeleton width={50} height={18} />
              ) : (
                tokenAccount.balance?.token.symbol ||
                (tokenAccount.mint && shortAddress(tokenAccount.mint?.toBase58()))
              )}
            </TokenSymbol>
            {loading ? (
              <Skeleton width={50} height={18} />
            ) : tokenAccount.balance ? (
              <AmountUSD symbol={tokenAccount.balance?.token.symbol} value={tokenAccount.balance} />
            ) : (
              <div />
            )}
          </Top>
          <Bottom>
            <div title={tokenAccount.mint?.toBase58()}>
              {loading ? <Skeleton width={100} height={14} /> : renderTokenName()}
            </div>
            <div>
              {loading ? (
                <Skeleton width={100} height={14} />
              ) : (
                <>{tokenAccount.balance?.formatUnits()}</>
              )}
            </div>
          </Bottom>
        </Content>
      </WrapperLink>
      {!isSOL ? (
        <MenuWrapper>
          <Menu vertical>
            <MenuItem onItemClick={handleMenuItemClick} icon={isHidden ? 'eye' : 'eye-hide'}>
              {isHidden ? 'Show' : 'Hide'}
            </MenuItem>
          </Menu>
        </MenuWrapper>
      ) : undefined}
    </Wrapper>
  );
};
