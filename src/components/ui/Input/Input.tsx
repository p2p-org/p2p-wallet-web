import React, { forwardRef, FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

const Wrapper = styled.label`
  display: flex;
  align-items: center;
  height: 56px;

  background: #f4f4f4;
  border-radius: 10px;
  cursor: text;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  padding: 0 16px;
`;

const PrefixWrapper = styled.div`
  margin-left: 10px;
`;

const Title = styled.div`
  color: ${rgba('#000', 0.5)};
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
`;

const InputElement = styled.input`
  padding: 0;

  font-family: unset;

  background: transparent;
  border: 0;

  outline: none;

  appearance: none;

  &:not(:first-child) {
    padding-top: 4px;
  }
`;

const PostfixWrapper = styled.div`
  margin-left: 16px;
`;

type CustomProps = {
  forwardedRef?: React.Ref<HTMLInputElement>;
  prefix?: React.ReactNode;
  title?: string;
  value?: string;
  postfix?: React.ReactNode;
  onChange?: (value: string) => void;
};

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & CustomProps;

const InputOriginal: FunctionComponent<Props> = ({
  forwardedRef,
  prefix,
  title,
  value,
  postfix,
  onChange,
  className,
  ...props
}) => {
  const handleChange = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <Wrapper className={className}>
      {prefix ? <PrefixWrapper>{prefix}</PrefixWrapper> : undefined}
      <Content>
        {title ? <Title>{title}</Title> : undefined}
        <InputElement ref={forwardedRef} value={value} onChange={handleChange} {...props} />
      </Content>
      {postfix ? <PostfixWrapper>{postfix}</PostfixWrapper> : undefined}
    </Wrapper>
  );
};

export const Input = forwardRef<HTMLInputElement, Props>(
  (props, ref: React.Ref<HTMLInputElement>) => <InputOriginal {...props} forwardedRef={ref} />,
);
