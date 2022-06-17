import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import { borders, theme, up } from '@p2p-wallet-web/ui';

import { TokenAvatarStyled } from 'components/common/TokenAccountRowContent';
import { MenuStyled } from 'components/pages/home/TokensWidget/TokenAccountList/TokenAccountRow/TokenMenu';
import type { Wallet } from 'new/app/sdk/SolanaSDK';
import { TokenAccountRowContent } from 'new/ui/views/TokenAccountRowContent';

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

interface Props {
  wallet?: Wallet;
  isLoading: boolean;
}

export const BaseWalletCell: FC<Props> = ({ wallet, isLoading }) => {
  return (
    <WrapperLink to={wallet ? `/wallet/${wallet.pubkey}` : ''}>
      <TokenAccountRowContent wallet={wallet} isLoading={isLoading} />
    </WrapperLink>
  );
};
