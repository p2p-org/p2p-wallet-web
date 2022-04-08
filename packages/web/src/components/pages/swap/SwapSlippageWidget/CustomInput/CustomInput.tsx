import type { FC } from 'react';
import { forwardRef } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

const Wrapper = styled.div`
  display: flex;
  color: ${theme.colors.textIcon.primary};
`;

const Postfix = styled.span`
  margin-left: ;
`;

const InputWrapper = styled.span``;

const InputElement = styled.input`
  width: 100%;

  font-weight: 500;
  font-size: 16px;
  font-style: normal;
  line-height: 140%;
  letter-spacing: 0.01em;

  border-width: 0;

  &:focus,
  &:active {
    border-width: 0;
  }
`;

type CustomProps = {
  forwardedRef?: React.Ref<HTMLInputElement>;
};

type Props = React.InputHTMLAttributes<HTMLInputElement> & CustomProps;

const CustomInputOriginal: FC<Props> = (props) => {
  return (
    <Wrapper>
      <InputWrapper>
        <InputElement placeholder="20" {...props} />
      </InputWrapper>
      <Postfix>%</Postfix>
    </Wrapper>
  );
};

export const CustomInput = forwardRef<HTMLInputElement, Props>(
  (props, ref: React.Ref<HTMLInputElement>) => (
    <CustomInputOriginal {...props} forwardedRef={ref} />
  ),
);
