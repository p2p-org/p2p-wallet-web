import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Icon } from 'components/ui';

export const IconWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: ${theme.colors.bg.secondary};
  border-radius: 12px;

  &.isFocused {
    background: ${theme.colors.bg.activePrimary};
    border: 1px solid ${theme.colors.textIcon.active};
  }

  &.isError {
    background: ${theme.colors.system.errorBg};
  }
`;

export const WalletIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.secondary};
`;
