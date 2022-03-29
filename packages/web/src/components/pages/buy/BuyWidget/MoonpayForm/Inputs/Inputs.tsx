import type { FC } from 'react';

import { styled } from '@linaria/react';
import { borders, theme } from '@p2p-wallet-web/ui';

import { useBuyState } from 'app/contexts';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { InputAmount } from 'components/ui/InputAmount';

import { AmountTypeButton } from '../AmountTypeButton';

const Wrapper = styled.div`
  border-radius: 12px;
  ${borders.secondary}
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: content-box;
  height: 36px;
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
  const {
    currency: { symbol },
    amount,
    setAmount,
    isBaseAmountType,
    changeAmountType,
    buyQuote,
    isLoading,
  } = useBuyState();

  const prefix = isBaseAmountType ? '$' : <TokenAvatar symbol={symbol} size={32} />;

  const buttonAmount =
    (isBaseAmountType ? buyQuote?.quoteCurrencyAmount : buyQuote?.baseCurrencyAmount) || 0;

  const buttonAmountFormatted = isBaseAmountType
    ? `${buttonAmount} ${symbol}`
    : `$ ${buttonAmount}`;

  return (
    <Wrapper>
      <InputWrapper>
        <Title>{isBaseAmountType ? 'You pay' : 'You get'}</Title>
        <InputAmount prefix={prefix} value={amount} onChange={setAmount} />
      </InputWrapper>
      <InputWrapper>
        <Title>{isBaseAmountType ? 'You get' : 'You pay'}</Title>
        <AmountTypeButton title={buttonAmountFormatted} onClick={changeAmountType} />
      </InputWrapper>
    </Wrapper>
  );
};
