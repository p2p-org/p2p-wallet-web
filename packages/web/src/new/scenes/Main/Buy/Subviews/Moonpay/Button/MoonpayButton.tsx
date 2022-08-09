import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { Button, Icon } from 'components/ui';
import type { BuyViewModel } from 'new/scenes/Main/Buy/Buy.ViewModel';
import { CryptoCurrency, FiatCurrency } from 'new/services/BuyService/structures';
import { formatNumberToUSD } from 'utils/format';

const IconWrapper = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 8px;
`;

interface Props {
  viewModel: BuyViewModel;
}

export const MoonpayButton: FC<Props> = observer(({ viewModel }) => {
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
    viewModel.input.currency instanceof FiatCurrency &&
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
    viewModel.input.currency instanceof CryptoCurrency &&
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
