import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  position: relative;

  height: 16px;
  margin-left: 26px;
`;

const ArrowIconWrapper = styled.div`
  position: relative;
  top: -8px;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  color: ${theme.colors.textIcon.active};

  background: ${theme.colors.bg.primary};
  border: 1px solid ${theme.colors.stroke.secondary};
  border-radius: 12px;

  &::before,
  &::after {
    position: absolute;

    width: 1px;
    height: 16px;

    background: ${theme.colors.bg.primary};

    content: '';
  }

  &::before {
    left: -1px;
  }

  &::after {
    right: -1px;
  }
`;

const ArrowIcon = styled(Icon)`
  width: 16px;
  height: 16px;
`;

export const ArrowDown: FC = () => {
  return (
    <Wrapper>
      <ArrowIconWrapper>
        <ArrowIcon name="arrow-down" />
      </ArrowIconWrapper>
    </Wrapper>
  );
};
