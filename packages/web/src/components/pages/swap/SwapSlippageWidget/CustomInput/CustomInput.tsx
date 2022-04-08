import { styled } from '@linaria/react';

const Wrapper = styled.div`
  display: flex;
`;

const Postfix = styled.span`
  flex-grow: 0;
  justify-self: flex-end;
`;

const InputWrapper = styled.span``;

const InputElement = styled.input`
  width: 100%;

  font-weight: 500;
  font-size: 16px;
  font-style: normal;
  line-height: 140%;
  letter-spacing: 0.01em;

  &:focus,
  &:active {
    border-width: 0;
  }
`;

export const CustomInput = () => {
  return (
    <Wrapper>
      <InputWrapper>
        <InputElement />
      </InputWrapper>
      <Postfix>%</Postfix>
    </Wrapper>
  );
};
