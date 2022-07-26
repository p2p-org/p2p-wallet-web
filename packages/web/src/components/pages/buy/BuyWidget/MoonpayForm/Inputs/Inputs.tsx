import type { FC } from 'react';

import { styled } from '@linaria/react';
import { useToken } from '@p2p-wallet-web/core';
import { TokenAmount } from '@p2p-wallet-web/token-utils';
import { borders, theme } from '@p2p-wallet-web/ui';

import { useBuyState, useConfig } from 'app/contexts';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { InputAmount } from 'components/ui/InputAmount';
import { AmountTypeButton } from 'new/ui/components/common/AmountTypeButton';
import { formatNumberToUSD } from 'utils/format';

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
  } = useBuyState();

  const { tokenConfigs } = useConfig();
  const token = useToken(tokenConfigs[symbol]?.mint);

  const prefix = isBaseAmountType ? '$' : <TokenAvatar symbol={symbol} size={32} />;

  const buttonAmount =
    Number(isBaseAmountType ? buyQuote?.quoteCurrencyAmount : buyQuote?.baseCurrencyAmount) || 0;

  const buttonAmountFormatted = isBaseAmountType
    ? TokenAmount.parse(token, buttonAmount.toString()).formatUnits()
    : formatNumberToUSD(buttonAmount, { alwaysShowCents: false });

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
