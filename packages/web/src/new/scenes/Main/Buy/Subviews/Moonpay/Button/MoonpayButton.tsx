import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { Button, Icon } from 'components/ui';
import type { BuyViewModelProps } from 'new/scenes/Main/Buy/Subviews/Moonpay/types';
import { trackEvent } from 'new/sdk/Analytics';
import { CryptoCurrency, FiatCurrency } from 'new/services/BuyService/structures';
import { numberToFiatString } from 'new/utils/NumberExtensions';

const IconWrapper = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 8px;
`;

export const MoonpayButton: FC<BuyViewModelProps> = observer(({ viewModel }) => {
  if (viewModel.loadingState.isLoading) {
    return (
      <Button disabled primary full>
        Loading...
      </Button>
    );
  }

  if (!viewModel.input.amount) {
    return (
      <Button disabled primary full>
        Enter the amount
      </Button>
    );
  }

  if (
    FiatCurrency.isFiat(viewModel.input.currency) &&
    viewModel.input.amount &&
    viewModel.minFiatAmount > viewModel.input.amount
  ) {
    return (
      <Button disabled primary full>
        Minimum amount {numberToFiatString(viewModel.minFiatAmount)}
      </Button>
    );
  }

  if (
    CryptoCurrency.isCrypto(viewModel.input.currency) &&
    viewModel.input.amount &&
    viewModel.minCryptoAmount > viewModel.input.amount
  ) {
    return (
      <Button disabled primary full>
        Minimum purchase of {viewModel.minCryptoAmount} {viewModel.crypto.symbol} required
      </Button>
    );
  }

  /*if (viewModel.loadingState.isError && viewModel.input.amount) {
    return (
      <Button disabled primary full>
        {viewModel.loadingState.message}
      </Button>
    );
  }*/

  return (
    <Button
      primary
      full
      onClick={() => {
        viewModel.setIsShowIframe(true);

        // track event
        const crypto = CryptoCurrency.isCrypto(viewModel.input.currency)
          ? viewModel.input
          : viewModel.output;
        const fiat = FiatCurrency.isFiat(viewModel.input.currency)
          ? viewModel.input
          : viewModel.output;

        trackEvent({
          name: 'Buy_Button_Pressed',
          params: {
            Sum_Currency: fiat.amount,
            Sum_Coin: crypto.amount,
            Currency: fiat.currency.symbol,
            Coin: crypto.currency.symbol,
          },
        });
      }}
    >
      <IconWrapper name="external" />
      Continue on Moonpay
    </Button>
  );
});
