import type { FunctionComponent } from 'react';
import React, { useCallback, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { borders, theme, up, useIsMobile, useIsTablet } from '@p2p-wallet-web/ui';
import { TokenAmount } from '@saberhq/token-utils';

import { useSettings } from 'app/contexts';
import { AmountUSD } from 'components/common/AmountUSD';
import { SwipeToRevealActions } from 'components/common/SwipeToRevealActions';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Icon } from 'components/ui';
import { shortAddress } from 'utils/tokens';

import { MenuStyled, TokenMenu } from './TokenMenu';

const IconStyled = styled(Icon)`
  width: 24px;
  height: 24px;
`;

const TokenAvatarStyled = styled(TokenAvatar)``;

const WrapperLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 24px;

  text-decoration: none;

  background: ${theme.colors.bg.primary};

  ${up.tablet} {
    padding: 12px 8px;

    border: 1px solid transparent;
    border-radius: 12px;
    cursor: pointer;

    &:hover {
      background: ${theme.colors.bg.activePrimary};
      ${borders.linksRGBA}

      ${TokenAvatarStyled} {
        background: transparent;
      }

      ${MenuStyled} {
        color: ${theme.colors.textIcon.active};
      }
    }
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: 12px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: 0.01em;

  ${up.tablet} {
    font-weight: 600;
    font-size: 16px;
  }
`;

const TokenName = styled.div`
  flex: 1;

  max-width: 300px;
  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
`;

const TokenMenuStyled = styled(TokenMenu)`
  margin-left: 8px;
`;

type Props = {
  tokenAccount: TokenAccount;
  isHidden?: boolean;
};

export const TokenAccountRow: FunctionComponent<Props> = ({ tokenAccount, isHidden }) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { toggleHideTokenAccount } = useSettings();

  const avatarSize = isMobile ? 32 : 44;
  const { loading } = tokenAccount;

  const handleToggleHideClick = useCallback(() => {
    const tokenAddress = tokenAccount.key?.toBase58();
    if (tokenAddress) {
      const isZero = !tokenAccount.balance || tokenAccount.balance.equalTo(0);
      toggleHideTokenAccount(tokenAddress, isZero);
    }
  }, [toggleHideTokenAccount, tokenAccount.balance, tokenAccount.key]);

  const actions = useMemo(
    () => [
      {
        icon: <IconStyled name={isHidden ? 'eye' : 'eye-hide'} />,
        onClick: handleToggleHideClick,
      },
    ],
    [handleToggleHideClick, isHidden],
  );

  // Mobile and not SOL
  const SwipeOrFragment =
    isMobile && !tokenAccount.balance?.token.isRawSOL ? SwipeToRevealActions : React.Fragment;

  return (
    <SwipeOrFragment {...(isMobile ? { actions } : {})}>
      <WrapperLink to={`/wallet/${tokenAccount.key?.toBase58()}`}>
        {loading ? (
          <Skeleton height={avatarSize} width={avatarSize} borderRadius={12} />
        ) : (
          <TokenAvatarStyled
            symbol={tokenAccount?.balance?.token.symbol}
            address={tokenAccount?.balance?.token.address}
            size={avatarSize}
          />
        )}
        <Content>
          <Top>
            <TokenName title={tokenAccount.balance?.token.address}>
              {loading ? (
                <Skeleton width={100} height={16} />
              ) : (
                tokenAccount.balance?.token.name ||
                tokenAccount.balance?.token.symbol ||
                (tokenAccount.balance?.token.address &&
                  shortAddress(tokenAccount.balance?.token.address))
              )}
            </TokenName>
            <div>
              {loading ? (
                <Skeleton width={100} height={14} />
              ) : (
                <>{tokenAccount.balance?.formatUnits()}</>
              )}
            </div>
          </Top>
          <Bottom>
            {loading ? (
              <Skeleton width={50} height={14} />
            ) : tokenAccount.balance ? (
              <AmountUSD value={new TokenAmount(tokenAccount.balance.token, 1)} />
            ) : (
              <div />
            )}
            {loading ? (
              <Skeleton width={50} height={14} />
            ) : tokenAccount.balance ? (
              <AmountUSD value={tokenAccount.balance} />
            ) : (
              <div />
            )}
          </Bottom>
        </Content>
        {isTablet ? <TokenMenuStyled tokenAccount={tokenAccount} isHidden={isHidden} /> : undefined}
      </WrapperLink>
    </SwipeOrFragment>
  );
};
