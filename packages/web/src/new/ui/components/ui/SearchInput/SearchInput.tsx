import type { FunctionComponent } from 'react';
import { forwardRef, useState } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { useDebouncedCallback } from 'use-debounce';

import { Icon } from 'components/ui';

const SearchIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: 16px;
`;

const SearchIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.secondary};
`;

const Wrapper = styled.label`
  display: flex;
  flex: 1;
  align-items: center;

  min-width: 0;
  height: 48px;
  padding: 12px 0;

  background: ${theme.colors.bg.primary};
  border: 1px solid ${theme.colors.stroke.primary};
  border-radius: 12px;
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

  min-width: 0;
`;

const InputElement = styled.input`
  margin-left: 8px;
  padding: 0;

  font-weight: 500;
  font-size: 16px;
  font-family: inherit;
  line-height: 140%;

  background: transparent;
  border: 0;

  outline: none;

  appearance: none;

  &::placeholder {
    color: ${theme.colors.textIcon.tertiary};
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
  initialValue?: string;
  onChange?: (value: string) => void;
};

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & CustomProps;

const SearchInputOriginal: FunctionComponent<Props> = ({
  forwardedRef,
  initialValue = '',
  onChange,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(initialValue);

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

  const debouncedOnChange = useDebouncedCallback(
    (value: string) => {
      if (onChange) {
        onChange(value);
      }
    },
    300,
    { trailing: true },
  );

  const handleChange = (e: React.FocusEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    debouncedOnChange(e.target.value);
  };

  const handleClear = () => {
    debouncedOnChange.cancel();

    setLocalValue('');

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
          value={localValue}
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
  (props, ref: React.Ref<HTMLInputElement>) => (
    <SearchInputOriginal {...props} forwardedRef={ref} />
  ),
);
