import type { FunctionComponent } from 'react';
import React from 'react';

import { styled } from '@linaria/react';

import { Icon } from 'components/ui';

const IconStyled = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: 44px;
  padding: 8px;

  color: #000;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;

  border-radius: 8px;
  cursor: pointer;

  &:hover {
    color: #5887ff;

    background: #f6f6f8;

    ${IconStyled} {
      color: #5887ff;
    }
  }
`;

const IconWrapper = styled.div`
  margin-right: 10px;
`;

type Props = {
  icon?: string;
  onItemClick: () => void;
  close?: () => void;
};

export const MenuItem: FunctionComponent<Props> = ({
  icon,
  children,
  onItemClick,
  close = () => {},
}) => {
  const handleItemClick = () => {
    onItemClick();
    close();
  };

  return (
    <Wrapper onClick={handleItemClick}>
      {icon ? (
        <IconWrapper>
          <IconStyled name={icon} />
        </IconWrapper>
      ) : undefined}
      {children}
    </Wrapper>
  );
};
