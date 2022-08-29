import type { FC, HTMLAttributes } from 'react';
import React from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;

  &:not(:last-child)::before {
    position: absolute;

    bottom: -12px;

    width: 100%;
    height: 1px;

    background: ${theme.colors.stroke.secondary};

    content: '';
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 8px;

  color: ${theme.colors.textIcon.secondary};
`;

const IconStyled = styled(Icon)`
  width: 20px;
  height: 20px;
`;

interface Props extends HTMLAttributes<HTMLDivElement> {
  icon: string;
}

export const ActionButton: FC<Props> = ({ icon, onClick, children }) => {
  return (
    <Wrapper onClick={onClick}>
      <IconWrapper>
        <IconStyled name={icon} />
      </IconWrapper>
      {children}
    </Wrapper>
  );
};
