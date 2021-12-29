import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { Icon } from 'components/ui';

const CheckmarkIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: transparent;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 8px;

  color: #000;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;

  text-transform: capitalize;

  border-radius: 8px;
  cursor: pointer;

  &:hover {
    color: #5887ff;

    background: #f6f6f8;

    ${CheckmarkIcon} {
      color: #a3a5ba;
    }
  }

  &.isSelected {
    ${CheckmarkIcon} {
      color: #5887ff;
    }
  }
`;

type Props = {
  isSelected: boolean;
  onItemClick: () => void;
  close?: () => void;
};

export const MenuItem: FunctionComponent<Props> = ({
  children,
  isSelected,
  onItemClick,
  close = () => {},
}) => {
  const handleItemClick = () => {
    onItemClick();
    close();
  };

  return (
    <Wrapper onClick={handleItemClick} className={classNames({ isSelected })}>
      {children} <CheckmarkIcon name="checkmark" />
    </Wrapper>
  );
};
