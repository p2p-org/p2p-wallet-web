import type { FC } from 'react';

import { styled } from '@linaria/react';
import { useToken } from '@p2p-wallet-web/core';
import { TokenAmount } from '@p2p-wallet-web/token-utils';
import { borders, theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { useConfig } from 'app/contexts';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { AmountTypeButton } from 'components/pages/buy/BuyWidget/MoonpayForm/AmountTypeButton';
import { InputAmount } from 'components/ui/InputAmount';
import type { BuyViewModel } from 'new/scenes/Main/Buy/Buy.ViewModel';
import { FiatCurrency } from 'new/services/BuyService/structures';
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

interface Props {
  viewModel: BuyViewModel;
}

export const Inputs: FC<Props> = observer(({ viewModel }) => {
  const { tokenConfigs } = useConfig();
  const token = useToken(tokenConfigs[viewModel.crypto.symbol]?.mint);
  const isFiatCurrency = viewModel.input.currency instanceof FiatCurrency;

  const prefix = isFiatCurrency ? '$' : <TokenAvatar symbol={viewModel.crypto.symbol} size={32} />;

  const buttonAmountFormatted = isFiatCurrency
    ? TokenAmount.parse(token, viewModel.output.amount.toString()).formatUnits()
    : formatNumberToUSD(viewModel.output.amount, { alwaysShowCents: false });

  return (
    <Wrapper>
      <InputWrapper>
        <Title>{isFiatCurrency ? 'You pay' : 'You get'}</Title>
        <InputAmount
          prefix={prefix}
          value={viewModel.input.amount}
          onChange={viewModel.setAmount}
        />
      </InputWrapper>
      <InputWrapper>
        <Title>{isFiatCurrency ? 'You get' : 'You pay'}</Title>
        <AmountTypeButton title={buttonAmountFormatted} onClick={viewModel.swap} />
      </InputWrapper>
    </Wrapper>
  );
});
