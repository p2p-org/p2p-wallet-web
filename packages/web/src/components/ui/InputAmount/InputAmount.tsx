import type { FC } from 'react';
import React, { useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

const WrapperLabel = styled.label`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: flex-end;

  /* Fix outer "margin" */
  min-width: 0;
`;

const textCss = `
  color: ${theme.colors.textIcon.primary};
  font-weight: 600;
  font-size: 28px;
  line-height: 120%;
`;

const Prefix = styled.div`
  margin-right: 8px;

  ${textCss}

  &.isText {
    margin-right: 4px;
  }
`;

const Input = styled.input`
  /* Fix outer "margin" */
  min-width: 0;
  padding: 0;

  text-align: right;

  background: transparent;
  border: 0;

  outline: none;

  appearance: none;

  ${textCss}

  &::placeholder {
    color: ${theme.colors.textIcon.secondary};
  }

  &.error {
    color: ${theme.colors.system.errorMain};
  }
`;

function toFixed(amount: string, decimals?: number): string {
  if (!decimals) {
    return amount;
  }

  if (amount.includes('.') && amount.split('.')[1]!.length > decimals) {
    return Number(amount).toFixed(decimals);
  }

  return amount;
}

const DECIMAL_ONLY = /^\d*(\.\d*)?$/;

interface Props
  extends Omit<
    React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    'prefix' | 'decimals' | 'onChange'
  > {
  prefix?: React.ReactNode;
  decimals?: number;
  onChange?: (val: string) => void;
}

export const InputAmount: FC<Props> = ({
  prefix,
  placeholder = '0',
  value = '',
  decimals,
  onChange,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value);

  useUpdateEffect(() => {
    if (Number(value) !== Number(localValue)) {
      setLocalValue(value);
    }
  }, [value]);

  // react to decimals change and notify parent with fixed value
  // useUpdateEffect(() => {
  //   if (onChange) {
  //     const _value = toFixed(String(value), decimals);
  //     onChange(_value);
  //   }
  // }, [decimals]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let nextValue = e.target.value.replace(/^0(\d+)/, '$1');

    if (nextValue === '.') {
      nextValue = '0.';
    }

    nextValue = toFixed(nextValue, decimals);

    if ((!Number.isNaN(nextValue) && DECIMAL_ONLY.test(nextValue)) || nextValue === '') {
      setLocalValue(nextValue);
      if (onChange) {
        onChange(nextValue);
      }
    }
  };

  // Calculate width of input for correct prefix render
  // on left side of input
  const width = useMemo(() => {
    const val = localValue || placeholder;
    if (val) {
      return String(val).length + 'ch';
    }
  }, [localValue, placeholder]);

  return (
    <WrapperLabel>
      {prefix ? (
        <Prefix
          className={classNames({
            isText: typeof prefix === 'string',
          })}
        >
          {prefix}
        </Prefix>
      ) : undefined}
      <Input
        {...props}
        placeholder={placeholder}
        value={localValue}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        onChange={handleChange}
        style={{ width }}
      />
    </WrapperLabel>
  );
};
