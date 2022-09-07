import type { FC } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import { borders, theme, up, useIsMobile, useIsTablet } from '@p2p-wallet-web/ui';

import { Icon } from 'components/ui';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { BaseWalletCellContent } from 'new/ui/components/common/BaseWalletCellContent';
import { TokenAvatarStyled } from 'new/ui/components/common/BaseWalletCellContent/styled';
import { SwipeToRevealActions } from 'new/ui/components/common/SwipeToRevealActions';

import { MenuStyled, TokenMenu } from './TokenMenu';

const wrapperCss = `
  display: flex;
  align-items: center;
  padding: 12px 24px;

  background: ${theme.colors.bg.primary};

  ${up.tablet} {
    padding: 12px 8px;

    border: 1px solid transparent;
    border-radius: 12px;
    cursor: pointer;
  }
`;

const IconStyled = styled(Icon)`
  width: 24px;
  height: 24px;
`;

const Wrapper = styled.div`
  ${wrapperCss};
`;

const WrapperLink = styled(Link)`
  ${wrapperCss};

  text-decoration: none;

  ${up.tablet} {
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

interface Props {
  wallet?: Wallet;
  isPlaceholder?: boolean;
  isHidden?: boolean;
  onToggleClick?: () => void;
}

export const BaseWalletCell: FC<Props> = ({
  wallet,
  isPlaceholder = false,
  isHidden = false,
  onToggleClick,
}) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (isPlaceholder) {
    return (
      <Wrapper>
        <BaseWalletCellContent isPlaceholder={isPlaceholder} />
      </Wrapper>
    );
  }

  const actions = [
    {
      icon: <IconStyled name={isHidden ? 'eye' : 'eye-hide'} />,
      onClick: onToggleClick,
    },
  ];

  // Mobile and not SOL
  const shouldHasSwipe = isMobile && !wallet?.token.isNativeSOL;
  const SwipeOrFragment = shouldHasSwipe ? SwipeToRevealActions : React.Fragment;

  return (
    <SwipeOrFragment {...(shouldHasSwipe ? { actions } : {})}>
      <WrapperLink to={wallet ? `/wallet/${wallet.pubkey}` : ''}>
        <BaseWalletCellContent wallet={wallet} />
        {isTablet && wallet ? (
          <TokenMenuStyled wallet={wallet} isHidden={isHidden} onToggleClick={onToggleClick!} />
        ) : undefined}
      </WrapperLink>
    </SwipeOrFragment>
  );
};