import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { TokenAvatar } from 'components/common/TokenAvatar';

const Wrapper = styled.div`
  display: flex;
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
    const value = e.target.value.trim();

    onChange(value);
  };

  return (
    <Wrapper>
      <TokenAvatar mint={value} size={44} />
      <ToInput placeholder="Public key" value={value} onChange={handleChange} />
    </Wrapper>
  );
};
