import type { FC } from 'react';
import { useMemo } from 'react';

import { styled } from '@linaria/react';
import { useToken, useTokensContext } from '@p2p-wallet-web/core';
import { TokenAmount } from '@p2p-wallet-web/token-utils';
import { borders, theme } from '@p2p-wallet-web/ui';
import { PublicKey } from '@solana/web3.js';

import { useBuyState } from 'app/contexts';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { InputAmount } from 'components/ui/InputAmount';
import { formatNumberToUSD } from 'utils/format';

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

const DOLLAR_DECIMALS = 2;
const QUOTE_CURRENCY_AMOUNT_DECIMALS = 5;

export const Inputs: FC = () => {
  const {
    currency: { symbol },
    amount,
    setAmount,
    isBaseAmountType,
    changeAmountType,
    buyQuote,
  } = useBuyState();

  const { tokenNameMap } = useTokensContext();
  const tokenInfo = tokenNameMap[symbol.toUpperCase()];
  const mint = useMemo(() => tokenInfo && new PublicKey(tokenInfo?.address), [tokenInfo?.address]);
  const token = useToken(mint);

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
        <InputAmount
          prefix={prefix}
          value={amount}
          onChange={setAmount}
          decimals={isBaseAmountType ? DOLLAR_DECIMALS : QUOTE_CURRENCY_AMOUNT_DECIMALS}
        />
      </InputWrapper>
      <InputWrapper>
        <Title>{isBaseAmountType ? 'You get' : 'You pay'}</Title>
        <AmountTypeButton title={buttonAmountFormatted} onClick={changeAmountType} />
      </InputWrapper>
    </Wrapper>
  );
};
