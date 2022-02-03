import type { FunctionComponent } from 'react';
import { forwardRef, useState } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { Icon } from 'components/ui';

const Wrapper = styled.label`
  display: flex;
  align-items: center;
  height: 48px;

  background: ${theme.colors.bg.primary};
  border: 1px solid ${theme.colors.stroke.primary};
  border-radius: 12px;
  cursor: text;

  &.isFocused {
    border: 1px solid ${theme.colors.textIcon.active};
  }
`;

const Content = styled.div`
  position: relative;

  display: flex;
  flex: 1;
  align-items: center;
  margin: 0 16px;
`;

const InputElement = styled.input`
  padding: 0;

  color: #000;
  font-weight: 600;
  font-size: 14px;
  font-family: unset;
  line-height: 140%;

  background: transparent;
  border: 0;

  outline: none;

  appearance: none;

  &:not(:first-child) {
    padding-top: 4px;
  }
`;

const SuffixWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;

  display: flex;

  font-weight: 600;
  font-size: 14px;
  font-family: unset;
  line-height: 140%;
`;

const TransparentValue = styled.div`
  margin-right: 2px;

  color: transparent;
`;

const ClearWrapper = styled.div`
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

const ClearIcon = styled(Icon)`
  width: 13px;
  height: 13px;

  color: #a3a5ba;
`;

type CustomProps = {
  forwardedRef?: React.Ref<HTMLInputElement>;
  prefix?: React.ReactNode;
  suffix?: string;
  postfix?: React.ReactNode;
  showClear?: boolean;
  onChange?: (value: string) => void;
};

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & CustomProps;

const InputOriginal: FunctionComponent<Props> = ({
  forwardedRef,
  prefix,
  value,
  suffix,
  postfix,
  showClear,
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

  const renderPostfix = () => {
    if (!postfix && !showClear) {
      return;
    }

    if (showClear) {
      return (
        <ClearWrapper onClick={handleClear}>
          <ClearIcon name="close" />
        </ClearWrapper>
      );
    }

    return postfix;
  };

  return (
    <Wrapper className={classNames(className, { isFocused })}>
      {prefix}
      <Content>
        <InputElement
          ref={forwardedRef}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        {suffix ? (
          <SuffixWrapper>
            <TransparentValue>{value}</TransparentValue>
            {suffix}
          </SuffixWrapper>
        ) : undefined}
      </Content>
      {renderPostfix()}
    </Wrapper>
  );
};

export const Input = forwardRef<HTMLInputElement, Props>(
  (props, ref: React.Ref<HTMLInputElement>) => <InputOriginal {...props} forwardedRef={ref} />,
);
