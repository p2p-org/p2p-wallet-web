import type { FC } from 'react';
import React, { useEffect, useRef, useState } from 'react';

import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';

const Wrapper = styled.div`
  display: flex;

  color: ${theme.colors.textIcon.primary};
`;

const Postfix = styled.span``;

const InputWrapper = styled.span``;

const InputElement = styled.input`
  width: 100%;

  font-weight: 500;
  font-size: 14px;
  font-style: normal;
  letter-spacing: 0.01em;

  border-width: 0;

  ${up.tablet} {
    font-size: 16px;
  }

  &:focus {
    outline: none;
  }
`;

type CustomProps = {
  deafultValue: string;
  onChangeValue: (value: string) => void;
  maxSlippage: number;
};

type Props = React.InputHTMLAttributes<HTMLInputElement> & CustomProps;

export const SlippageInput: FC<Props> = ({ deafultValue, maxSlippage, onChangeValue }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(deafultValue);

  useEffect(() => {
    ref.current && ref.current.focus();
  }, [ref.current]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/,/g, '.'); // , to .

    // // ability to enter dot
    if (newValue === '.') {
      newValue = '0.';
    } else {
      newValue = newValue
        .replace(/[^.\d]/g, '')
        .replace(/^0+(\d)/, '$1')
        .replace(/^\./, '0.')
        .replace(/(\d+\.\d{0,1})(\d+)?/, '$1');
    }

    setInputValue(newValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);

    onChangeValue(String(Math.min(newValue, maxSlippage)));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', 'Escape'].includes(e.key)) {
      handleBlur(e as unknown as React.FocusEvent<HTMLInputElement>);
    }
  };

  return (
    <Wrapper>
      <InputWrapper>
        <InputElement
          ref={ref}
          type="text"
          inputMode="decimal"
          placeholder="20"
          value={inputValue}
          onChange={handleValueChange}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
        />
      </InputWrapper>
      <Postfix>%</Postfix>
    </Wrapper>
  );
};
