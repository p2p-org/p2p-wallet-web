import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { Button, Icon } from 'components/ui';
import type { BuyViewModelProps } from 'new/scenes/Main/Buy/Subviews/Moonpay/types';
import { CryptoCurrency, FiatCurrency } from 'new/services/BuyService/structures';
import { formatNumberToUSD } from 'utils/format';

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
        Minimum amount {formatNumberToUSD(viewModel.minFiatAmount)}
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

  if (viewModel.loadingState.isError && viewModel.input.amount) {
    return (
      <Button disabled primary full>
        {viewModel.loadingState.message}
      </Button>
    );
  }

  return (
    <Button primary full onClick={() => viewModel.setIsShowIframe(true)}>
      <IconWrapper name="external" />
      Continue on Moonpay
    </Button>
  );
});
