import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { styled } from '@linaria/react';
import { borders, theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import type { BuyViewModelProps } from 'new/scenes/Main/Buy/Subviews/Moonpay/types';
import type { Token } from 'new/sdk/SolanaSDK';
import { FiatCurrency } from 'new/services/BuyService/structures';
import { Defaults } from 'new/services/Defaults';
import { TokenAvatar } from 'new/ui/components/common/TokenAvatar';
import { AmountTypeButton } from 'new/ui/components/pages/buy/AmountTypeButton';
import { InputAmount } from 'new/ui/components/ui/InputAmount';
import { numberToFiatString, numberToTokenString } from 'new/utils/NumberExtensions';

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

export const Inputs: FC<BuyViewModelProps> = observer(({ viewModel }) => {
  const [token, setToken] = useState<Token | undefined>();

  useEffect(() => {
    viewModel.getToken(viewModel.crypto.mintAddress).then(setToken);
  }, [viewModel.crypto.mintAddress]);

  const isFiatInputCurrency = FiatCurrency.isFiat(viewModel.input.currency);

  const prefix = isFiatInputCurrency ? (
    Defaults.fiat.symbol
  ) : (
    <TokenAvatar token={token} size={32} />
  );

  const buttonAmountFormatted = isFiatInputCurrency
    ? token
      ? numberToTokenString(viewModel.output.amount, token)
      : ''
    : numberToFiatString(viewModel.output.amount);

  return (
    <Wrapper>
      <InputWrapper>
        <Title>{isFiatInputCurrency ? 'You pay' : 'You get'}</Title>
        <InputAmount
          prefix={prefix}
          value={viewModel.input.amount}
          onChange={viewModel.setAmount}
        />
      </InputWrapper>
      <InputWrapper>
        <Title>{isFiatInputCurrency ? 'You get' : 'You pay'}</Title>
        <AmountTypeButton title={buttonAmountFormatted} onClick={viewModel.swap} />
      </InputWrapper>
    </Wrapper>
  );
});
