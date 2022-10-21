import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';
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

  ${up.tablet} {
    font-size: 16px;
  }
`;

const CheckIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-left: 4px;

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
    background: ${theme.colors.bg.activePrimary};
    border-color: ${theme.colors.textIcon.links};
  }

  &.isSelected {
    ${Value} {
      font-weight: 700;
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
