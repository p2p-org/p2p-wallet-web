import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import type { Props as IconProps } from 'components/ui';
import { Icon } from 'components/ui';

export const Section = styled.div`
  display: grid;
  padding: 20px 0;

  &.swap {
    padding: 20px 0 0;
  }

  &.send {
    grid-gap: 16px;
    padding: 16px 0;
  }

  &.password {
    padding: 8px 0 24px;
  }
`;

export const SectionTitle = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

export const FieldInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;

  border: 1px solid ${theme.colors.stroke.secondary};
  border-radius: 12px;
`;

export const WalletIcon = styled<IconProps>(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.secondary};
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: ${theme.colors.bg.secondary};
  border-radius: 12px;
`;

export const InfoWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin: 0 9px 0 12px;
`;

export const InfoTitle = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;

  &.secondary {
    color: ${theme.colors.textIcon.secondary};
    font-size: 14px;
    line-height: 120%;
  }
`;

export const Username = styled(InfoTitle)`
  color: #000;
  font-size: 16px;
`;

export const InfoValue = styled.div`
  margin-top: 4px;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 14px;
  line-height: 120%;
  letter-spacing: 0.01em;
`;

export const Subtitle = styled.div`
  margin-left: 20px;
  margin-top: 16px;
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
`;

export const Wrapper = styled.div`
  position: relative;
  margin-bottom: 8px;
`;

export const FromToWrapper = styled.div`
  position: absolute;
  border: 1px solid ${theme.colors.stroke.secondary};
  width: 32px;
  height: 32px;
  background: ${theme.colors.bg.primary};
  border-radius: 40%;
  left: 27px;
  top: 107px;
  color: ${theme.colors.textIcon.active};

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const Overlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 19px;

  position: absolute;
  width: 34px;
  top: 5px;
  left: -2px;
  background: ${theme.colors.bg.primary};
`;
