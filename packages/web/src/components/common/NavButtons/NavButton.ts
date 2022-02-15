import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

export const NavButton = styled.button`
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  color: ${theme.colors.textIcon.buttonPrimary};
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: 0.02em;

  background: rgba(255, 255, 255, 0.1);
  border: 1px solid transparent;

  &:first-child {
    border-radius: 16px 0 0 16px;
  }

  &:last-child {
    border-radius: 0 16px 16px 0;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /*
  &:focus {
    background: rgba(255, 255, 255, 0.1);

    &::before {
      position: absolute;
      top: -2px;
      right: -2px;
      bottom: -2px;
      left: -2px;

      border: 1px solid #fff;
      border-radius: 12px;

      content: '';
    }
  }

  &:active {
    background: transparent;

    &::before {
      display: none;
    }
  }
   */

  &:focus {
    background: rgba(255, 255, 255, 0.1);
  }

  &:active {
    background: transparent;

    &::before {
      position: absolute;
      top: -3px;
      right: -3px;
      bottom: -3px;
      left: -3px;

      border: 1px solid #fff;
      border-radius: 16px;

      content: '';
    }
  }
`;
