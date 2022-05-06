import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';

import { Button } from 'components/ui';

export const ButtonStyled = styled(Button)`
  box-sizing: border-box;
  height: 33px;
  padding: 8px 0;

  font-weight: 500;
  font-size: 14px;
  line-height: 120%;

  border: 1px solid ${theme.colors.stroke.primary};
  border-radius: 8px;

  ${up.tablet} {
    height: 38px;

    font-size: 16px;
    line-height: 140%;
  }

  &.custom {
    width: 69px;

    ${up.tablet} {
      width: 93px;
    }

    &.active {
      background-color: inherit;
    }
  }

  &.custom.active.editing {
    padding: 0 10px;

    ${up.tablet} {
      padding: 0 20px;
    }
  }

  &.active {
    color: ${theme.colors.textIcon.active};

    font-weight: 700;

    background-color: ${theme.colors.bg.activePrimary};
    border-color: ${theme.colors.bg.buttonPrimary};
  }

  &:hover {
    background-color: ${theme.colors.bg.activePrimary};
  }
`;
