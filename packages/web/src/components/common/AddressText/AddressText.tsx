import type { FC } from 'react';
import React from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

const Address = styled.div`
  flex-grow: 1;

  font-weight: 600;
  color: #000;

  &.small {
    font-size: 14px;
  }

  &.medium {
    font-size: 16px;
  }

  &.big {
    font-size: 18px;
  }

  &.gray {
    color: #a3a5ba;
  }
`;

const BlueText = styled.span`
  color: #5887ff;
`;

type Props = {
  address: string;
  small?: boolean;
  medium?: boolean;
  big?: boolean;
  gray?: boolean;
  className?: string;
};

export const AddressText: FC<Props> = ({
  address,
  small,
  medium,
  big,
  gray = false,
  className,
}) => {
  return (
    <Address className={classNames(className, { gray, small, medium, big })}>
      <BlueText>{address.slice(0, 4)}</BlueText>
      {address.slice(4, -4)}
      <BlueText>{address.slice(-4)}</BlueText>
    </Address>
  );
};
