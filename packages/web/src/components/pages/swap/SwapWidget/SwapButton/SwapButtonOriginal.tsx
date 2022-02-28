import type { FC } from 'react';

import { ModalType, useModals } from 'app/contexts/general/modals';
import { ButtonState, useSwap } from 'app/contexts/solana/swap';
import { Button } from 'components/ui';
import { trackEvent } from 'utils/analytics';

export const SwapButtonOriginal: FC = () => {
  const { openModal } = useModals();
  const { buttonState, trade, onSwap } = useSwap();

  const handleSwapClick = async () => {
    trackEvent('Swap_Verification_Invoked');

    const result = await openModal<boolean>(ModalType.SHOW_MODAL_TRANSACTION_CONFIRM, {
      type: 'swap',
      params: {
        inputTokenName: trade.inputTokenName,
        outputTokenName: trade.outputTokenName,
        inputAmount: trade.getInputAmount(),
        minimumOutputAmount: trade.getMinimumOutputAmount(),
      },
    });

    if (!result) {
      return false;
    }

    openModal(ModalType.SHOW_MODAL_TRANSACTION_STATUS, {
      type: 'swap',
      action: onSwap,
      params: {
        inputTokenName: trade.inputTokenName,
        outputTokenName: trade.outputTokenName,
        inputAmount: trade.getInputAmount(),
        minimumOutputAmount: trade.getMinimumOutputAmount(),
      },
    });
  };

  switch (buttonState) {
    case ButtonState.ConnectWallet:
      return (
        <Button primary big full onClick={() => {}}>
          Connect wallet
        </Button>
      );
    case ButtonState.Exchange:
      return (
        <Button primary big full onClick={handleSwapClick}>
          Swap
        </Button>
      );
    case ButtonState.Retry:
      return (
        <Button primary big full onClick={handleSwapClick}>
          Retry
        </Button>
      );
    case ButtonState.HighPriceImpact:
      return (
        <Button primary big full onClick={handleSwapClick}>
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
