import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { borders, theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { Icon } from 'components/ui';

const Value = styled.div`
  display: flex;
  flex: 1;
  align-items: center;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

const CheckIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: transparent;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;

  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;

  &:hover {
    ${CheckIcon} {
      color: #a3a5ba;
    }
  }

  &.isSelected {
    background: ${theme.colors.bg.activePrimary};
    ${borders.linksRGBA}

    ${Value} {
      font-weight: bold;
      font-size: 16px;
    }

    ${CheckIcon} {
      color: ${theme.colors.textIcon.active};
    }
  }
`;

type Props = {
  isSelected: boolean;
  onItemClick: () => void;
  close?: () => void;
};

export const SelectItem: FunctionComponent<Props> = ({
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
      <Value>{children}</Value>
      <CheckIcon name="check" />
    </Wrapper>
  );
};
