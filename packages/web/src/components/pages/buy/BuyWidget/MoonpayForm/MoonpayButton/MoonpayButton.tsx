import type { FC } from 'react';

import { styled } from '@linaria/react';

import { useBuyState } from 'app/contexts';
import { Button, Icon } from 'components/ui';

const IconWrapper = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 8px;
`;

export const MoonpayButton: FC = () => {
  const { isLoading, setIsShowIframe, error, amount, isBaseAmountType, buyQuote } = useBuyState();

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

  if (
    isBaseAmountType &&
    buyQuote?.baseCurrencyAmount &&
    buyQuote?.baseCurrencyAmount > Number(amount)
  ) {
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
      <IconWrapper name="external" />
      Continue on Moonpay
    </Button>
  );
};
