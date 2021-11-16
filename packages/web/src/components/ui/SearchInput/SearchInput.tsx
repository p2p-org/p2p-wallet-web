import type { FunctionComponent } from 'react';
import React, { forwardRef, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { Icon } from 'components/ui';

const SearchIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin: 0 4px;
`;

const SearchIcon = styled(Icon)`
  width: 34px;
  height: 34px;

  color: #a3a5ba;
`;

const Wrapper = styled.label`
  display: flex;
  flex: 1;
  align-items: center;
  height: 42px;

  background: #f6f6f8;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: text;

  &.isFocused {
    border: 1px solid rgba(163, 165, 186, 0.5);

    ${SearchIcon} {
      color: #000;
    }
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
`;

const InputElement = styled.input`
  padding: 0;

  font-weight: 600;
  font-size: 14px;
  font-family: unset;
  line-height: 140%;

  background: transparent;
  border: 0;

  outline: none;

  appearance: none;

  &::placeholder {
    color: #a3a5ba;
  }
`;

const SearchClearWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0 7px;

  background: #fff;
  border-radius: 8px;
  cursor: pointer;
`;

const SearchClearIcon = styled(Icon)`
  width: 13px;
  height: 13px;

  color: #a3a5ba;
`;

type CustomProps = {
  forwardedRef?: React.Ref<HTMLInputElement>;
  value?: string;
  onChange?: (value: string) => void;
};

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & CustomProps;

const InputOriginal: FunctionComponent<Props> = ({
  forwardedRef,
  value,
  onChange,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);

    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const handleChange = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
  };

  return (
    <Wrapper className={classNames(className, { isFocused })}>
      <SearchIconWrapper>
        <SearchIcon name="search" />
      </SearchIconWrapper>
      <Content>
        <InputElement
          ref={forwardedRef}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
      </Content>
      <SearchClearWrapper onClick={handleClear}>
        <SearchClearIcon name="close" />
      </SearchClearWrapper>
    </Wrapper>
  );
};

export const SearchInput = forwardRef<HTMLInputElement, Props>(
  (props, ref: React.Ref<HTMLInputElement>) => <InputOriginal {...props} forwardedRef={ref} />,
);
