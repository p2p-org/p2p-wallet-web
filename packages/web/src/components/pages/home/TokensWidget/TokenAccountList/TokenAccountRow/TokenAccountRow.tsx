import type { FunctionComponent } from 'react';
import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { borders, theme, up, useIsMobile, useIsTablet } from '@p2p-wallet-web/ui';

import { useSettings } from 'app/contexts';
import { SwipeToRevealActions } from 'components/common/SwipeToRevealActions';
import {
  TokenAccountRowContent,
  TokenAvatarStyled,
} from 'components/common/TokenAccountRowContent';
import { Icon } from 'components/ui';

import { MenuStyled, TokenMenu } from './TokenMenu';

const IconStyled = styled(Icon)`
  width: 24px;
  height: 24px;
`;

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
        <TokenAccountRowContent tokenAccount={tokenAccount} />
        {isTablet ? <TokenMenuStyled tokenAccount={tokenAccount} isHidden={isHidden} /> : undefined}
      </WrapperLink>
    </SwipeOrFragment>
  );
};
