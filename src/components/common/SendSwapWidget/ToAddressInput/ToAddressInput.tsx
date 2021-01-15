import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  display: flex;
`;

const Circle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: #f6f6f8;
  border-radius: 50%;
`;

const WalletIcon = styled(Icon)`
  width: 24px;
  height: 24px;
`;

const ToInput = styled.input`
  flex: 1;
  margin-left: 20px;

  color: #000;
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;

  background: transparent;
  border: 0;

  outline: none;

  appearance: none;

  &::placeholder {
    color: #c2c2c2;
  }
`;

type Props = {
  value: string;
  onChange: (publicKey: string) => void;
};

export const ToAddressInput: FunctionComponent<Props> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value.trim();

    onChange(nextValue);
  };

  return (
    <Wrapper>
      <Circle>
        <WalletIcon name="wallet" />
      </Circle>
      <ToInput placeholder="Enter wallet address" value={value} onChange={handleChange} />
    </Wrapper>
  );
};
