import React, { FunctionComponent, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { rgba } from 'polished';

import { Icon } from 'components/ui';

const WalletIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: #f6f6f8;
  border-radius: 12px;

  &.isFocused {
    background: #5887ff !important;

    ${WalletIcon} {
      color: #fff !important;
    }
  }
`;

const WrapperLabel = styled.label`
  display: flex;

  &:hover {
    ${IconWrapper} {
      background: #eff3ff;

      ${WalletIcon} {
        color: #5887ff;
      }
    }
  }
`;

const ToInput = styled.input`
  flex: 1;
  margin-left: 20px;

  color: #000;
  font-weight: 600;
  font-size: 18px;
  line-height: 120%;

  background: transparent;
  border: 0;

  outline: none;

  appearance: none;

  &::placeholder {
    color: ${rgba('#A3A5BA', 0.5)};
  }
`;

type Props = {
  value: string;
  onChange: (publicKey: string) => void;
};

export const ToAddressInput: FunctionComponent<Props> = ({ value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value.trim();

    onChange(nextValue);
  };

  return (
    <WrapperLabel>
      <IconWrapper className={classNames({ isFocused })}>
        <WalletIcon name="wallet" />
      </IconWrapper>
      <ToInput
        placeholder="Enter address"
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </WrapperLabel>
  );
};
