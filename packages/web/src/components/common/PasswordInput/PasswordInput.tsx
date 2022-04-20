import type { FC } from 'react';
import { useState } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { Icon } from 'components/ui';

const WrapperLabel = styled.label`
  position: relative;

  display: flex;
  align-items: center;
  height: 54px;
  padding: 0 15px;

  border: 1px solid #d3d4de;
  border-radius: 12px;
  cursor: text;

  &.isFocused {
    background: #fff;
    border-color: #5887ff;
    caret-color: #5887ff;
  }

  &.isError {
    border-color: #f43d3d;
  }
`;

const Mask = styled.div`
  position: absolute;
  top: 14px;
  left: 16px;

  color: #202020;

  font-weight: 500;
  font-size: 16px;
  line-height: 140%;

  opacity: 0;

  &.isVisible {
    opacity: 1;
  }
`;

const Input = styled.input`
  flex: 1;

  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 22px;

  background: transparent;
  border: 0;
  outline: none;

  opacity: 0;

  appearance: none;

  &::placeholder {
    color: #d2d4e5;

    font-weight: 500;
    font-size: 16px;
    font-family: 'Inter', sans-serif;
    font-style: normal;
    line-height: 140%;
  }

  &.isVisible {
    opacity: 1;
  }
`;

const EyeWrapper = styled.div`
  cursor: pointer;
`;

const EyeIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #8e8e93;
`;

const REGEX_PASSWORD = /[^\w!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-]+/g;

type Props = {
  onChange: (password: string) => void;
  isError: boolean;
};

export const PasswordInput: FC<
  Props & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'>
> = ({ onChange, onFocus, onBlur, className, isError, ...props }) => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(REGEX_PASSWORD, '');
    onChange(value);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);

    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    if (onBlur) {
      onBlur(e);
    }
  };

  const handleToggleShowPassword = () => {
    setIsShowPassword((state) => !state);
  };

  const maskValue = String(props.value)?.replace(/[\w,\d,\W]/g, '*');

  return (
    <WrapperLabel className={classNames(className, { isFocused, isError })}>
      <Input
        type={isShowPassword ? 'input' : 'password'}
        {...props}
        placeholder={'Password'}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={classNames({ isVisible: isShowPassword })}
      />
      <Mask className={classNames({ isVisible: !isShowPassword })}>{maskValue}</Mask>
      <EyeWrapper onClick={handleToggleShowPassword}>
        <EyeIcon name={isShowPassword ? 'eye' : 'eye-hide'} />
      </EyeWrapper>
    </WrapperLabel>
  );
};
