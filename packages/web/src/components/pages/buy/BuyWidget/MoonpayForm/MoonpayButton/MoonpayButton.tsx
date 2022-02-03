import type { FC } from 'react';

import { useBuyState } from 'app/contexts';
import { Button } from 'components/ui';

export const MoonpayButton: FC = () => {
  const { isLoading, setIsShowIframe, error, amount, buyQuote } = useBuyState();

  if (isLoading) {
    return (
      <Button disabled primary full>
        Loading...
      </Button>
    );
  }

  if (!Number(amount)) {
    return (
      <Button disabled primary full>
        Enter the amount
      </Button>
    );
  }

  if (buyQuote?.baseCurrencyAmount && buyQuote?.baseCurrencyAmount > Number(amount)) {
    return (
      <Button disabled primary full>
        Minimum amount ${buyQuote.baseCurrencyAmount}
      </Button>
    );
  }

  if (error && amount) {
    return (
      <Button disabled primary full>
        {error}
      </Button>
    );
  }

  return (
    <Button primary full onClick={() => setIsShowIframe(true)}>
      Continue with Moonpay
    </Button>
  );
};
