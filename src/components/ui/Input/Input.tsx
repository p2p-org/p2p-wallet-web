import React, { forwardRef, FunctionComponent } from 'react';

import { styled } from 'linaria/react';
import { rgba } from 'polished';

const Wrapper = styled.label`
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 16px;

  background: #f4f4f4;
  border-radius: 10px;
  cursor: text;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
`;

const Title = styled.div`
  color: ${rgba('#000', 0.5)};
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
`;

const InputElement = styled.input`
  padding: 4px 0 0;

  background: transparent;
  border: 0;

  outline: none;

  appearance: none;
`;

const PotfixWrapper = styled.div`
  margin-left: 16px;
`;

type Props = {
  forwardedRef?: React.Ref<HTMLInputElement>;
  title?: string;
  value?: string;
  postfix?: React.ReactNode;
};

const InputOriginal: FunctionComponent<Props> = ({ forwardedRef, title, value, postfix }) => {
  return (
    <Wrapper>
      <Content>
        {title ? <Title>{title}</Title> : undefined}
        <InputElement ref={forwardedRef} value={value} />
      </Content>
      {postfix ? <PotfixWrapper>{postfix}</PotfixWrapper> : undefined}
    </Wrapper>
  );
};

export const Input = forwardRef<HTMLInputElement, Props>(
  (props, ref: React.Ref<HTMLInputElement>) => <InputOriginal {...props} forwardedRef={ref} />,
);
