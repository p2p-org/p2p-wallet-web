import React, { FC } from 'react';

import { ButtonState, useSwap } from 'app/contexts/swap';
import { Button } from 'components/ui';

export const SwapButtonOriginal: FC = () => {
  const { buttonState, trade, onSwap } = useSwap();

  switch (buttonState) {
    case ButtonState.ConnectWallet:
      return (
        <Button primary big full onClick={() => {}}>
          Connect wallet
        </Button>
      );
    case ButtonState.Exchange:
      return (
        <Button primary big full onClick={onSwap}>
          Swap
        </Button>
      );
    case ButtonState.Retry:
      return (
        <Button primary big full onClick={onSwap}>
          Retry
        </Button>
      );
    case ButtonState.HighPriceImpact:
      return (
        <Button primary big full onClick={onSwap}>
          Swap Anyway
        </Button>
      );
    case ButtonState.RouteDoesNotExist:
      return (
        <Button primary big full disabled>
          Trading pair not supported
        </Button>
      );
    case ButtonState.InputTokenAccountDoesNotExist:
      return (
        <Button primary big full disabled>
          You don&apos;t own any {trade.inputTokenName}
        </Button>
      );
    case ButtonState.ZeroInputValue:
      return (
        <Button primary big full disabled>
          Swap
        </Button>
      );
    case ButtonState.NotEnoughSOL:
      return (
        <Button primary big full disabled>
          Not enough SOL
        </Button>
      );
    case ButtonState.InsufficientBalance:
      return (
        <Button primary big full disabled>
          Not enough {trade.inputTokenName}
        </Button>
      );
    case ButtonState.ConfirmWallet:
      return (
        <Button primary big full disabled>
          Approve in wallet...
        </Button>
      );
    case ButtonState.SendingTransaction:
      return (
        <Button primary big full disabled>
          Confirming...
        </Button>
      );
    case ButtonState.LoadingUserData:
      return (
        <Button primary big full disabled>
          Connecting wallet...
        </Button>
      );
    default:
      return null;
  }
};
