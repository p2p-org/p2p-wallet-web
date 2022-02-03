import type { FC } from 'react';

import { styled } from '@linaria/react';
import { borders, theme } from '@p2p-wallet-web/ui';

import { useBuyState } from 'app/contexts';
import { InputAmount } from 'components/ui/InputAmount';

const Wrapper = styled.div`
  border-radius: 12px;
  ${borders.secondary}
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;

  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.stroke.secondary};
  }
`;

const Title = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

export const Inputs: FC = () => {
  const { amount, setAmount, buyQuote } = useBuyState();

  return (
    <Wrapper>
      <InputWrapper>
        <Title>You pay</Title>
        <InputAmount prefix="$" value={amount} onChange={setAmount} />
      </InputWrapper>
      <InputWrapper>
        <Title>You get</Title>
        <div>
          {buyQuote?.quoteCurrencyAmount || 0} {buyQuote?.quoteCurrencyCode.toUpperCase()}
        </div>
      </InputWrapper>
    </Wrapper>
  );
};
