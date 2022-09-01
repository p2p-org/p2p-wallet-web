import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

const Address = styled.div`
  flex-grow: 1;

  color: ${theme.colors.textIcon.primary};
  font-weight: 600;

  &.small {
    font-weight: normal;
    font-size: 14px;
    line-height: 140%;
    letter-spacing: 0.05em;
  }

  &.medium {
    font-weight: 500;
    font-size: 16px;
    line-height: 140%;
    letter-spacing: 0.04em;
  }

  &.big {
    font-size: 18px;
  }
`;

const BlueText = styled.span`
  color: ${theme.colors.textIcon.active};
`;

type Props = {
  address: string;
  small?: boolean;
  medium?: boolean;
  big?: boolean;
  gray?: boolean;
  className?: string;
};

// TODO: trim middle symbols if don't fit width
export const AddressText: FC<Props> = ({
  address,
  small,
  medium,
  big,
  gray = false,
  className,
}) => {
  return (
    <Address title={address} className={classNames(className, { gray, small, medium, big })}>
      <BlueText>{address.slice(0, 4)}</BlueText>
      {address.slice(4, -4)}
      <BlueText>{address.slice(-4)}</BlueText>
    </Address>
  );
};
