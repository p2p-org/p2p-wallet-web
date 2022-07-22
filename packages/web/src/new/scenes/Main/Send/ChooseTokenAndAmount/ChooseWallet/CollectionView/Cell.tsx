import type { FC } from 'react';

import { styled } from '@linaria/react';
import { borders, theme, up } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { Icon } from 'components/ui';
import type { Wallet } from 'new/sdk/SolanaSDK';
import {
  BaseWalletCellContent,
  TokenAvatarStyled,
} from 'new/ui/components/common/BaseWalletCellContent';

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

const CheckIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  margin-left: 12px;

  color: transparent;

  ${up.tablet} {
    width: 24px;
    height: 24px;
  }
`;

const Wrapper = styled.div`
  ${wrapperCss}

  ${up.tablet} {
    &:hover:enabled {
      background: ${theme.colors.bg.activePrimary};
      ${borders.linksRGBA}

      ${TokenAvatarStyled} {
        background: transparent;
      }
    }
  }

  &.isSelected {
    ${CheckIcon} {
      color: ${theme.colors.textIcon.active};
    }
  }
`;

interface Props {
  wallet?: Wallet;
  isPlaceholder?: boolean;
  isSelected?: boolean;
  onWalletClick?: () => void;
}

export const Cell: FC<Props> = ({ wallet, isPlaceholder, isSelected, onWalletClick }) => {
  return (
    <Wrapper onClick={onWalletClick} className={classNames({ isSelected })}>
      <BaseWalletCellContent wallet={wallet} isPlaceholder={isPlaceholder} />
      <CheckIcon name="check" />
    </Wrapper>
  );
};
