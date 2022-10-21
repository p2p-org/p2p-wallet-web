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
  defaultValue: string;
  onChangeValue: (value: string) => void;
  maxSlippage?: number;
};

type Props = React.InputHTMLAttributes<HTMLInputElement> & CustomProps;

export const SlippageInput: FC<Props> = ({ defaultValue, maxSlippage = 50, onChangeValue }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    ref.current && ref.current.focus();
  }, [ref.current]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/,/g, '.'); // , to .

    // // ability to enter dot
    if (newValue === '.') {
      newValue = '0.';
    } else {
      newValue = newValue.replace(/(\D*)(\d*(\.\d{0,2})?)(.*)/, '$2').replace(/^0(\d+)/, '$1');
    }

    const numberValue = Number(newValue);
    if (newValue === numberValue.toString()) {
      if (numberValue <= maxSlippage) {
        setInputValue(Math.min(numberValue, maxSlippage).toString());
      } else {
        // ignore
      }
    } else {
      setInputValue(newValue);
    }
  };

  const changeValue = (value: string) => {
    onChangeValue(String(Math.min(Number(value), maxSlippage)));
  };

  const handleBlur = () => {
    changeValue(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', 'Escape'].includes(e.key)) {
      changeValue(inputValue);
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
