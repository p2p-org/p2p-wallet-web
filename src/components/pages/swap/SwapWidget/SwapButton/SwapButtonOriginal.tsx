import React, { FC } from 'react';
import { useDispatch } from 'react-redux';

import { unwrapResult } from '@reduxjs/toolkit';

import { ButtonState, useSwap } from 'app/contexts/swap';
import { Button } from 'components/ui';
import { openModal } from 'store/actions/modals';
import {
  SHOW_MODAL_TRANSACTION_CONFIRM,
  SHOW_MODAL_TRANSACTION_STATUS,
} from 'store/constants/modalTypes';

export const SwapButtonOriginal: FC = () => {
  const dispatch = useDispatch();
  const { buttonState, trade, onSwap } = useSwap();

  const handleSwapClick = async () => {
    const result = unwrapResult(
      await dispatch(
        openModal({
          modalType: SHOW_MODAL_TRANSACTION_CONFIRM,
          props: {
            type: 'swap',
            params: {
              inputTokenName: trade.inputTokenName,
              outputTokenName: trade.outputTokenName,
              inputAmount: trade.getInputAmount(),
              minimumOutputAmount: trade.getMinimumOutputAmount(),
            },
          },
        }),
      ),
    );

    if (!result) {
      return false;
    }

    unwrapResult(
      await dispatch(
        openModal({
          modalType: SHOW_MODAL_TRANSACTION_STATUS,
          props: {
            type: 'swap',
            action: onSwap,
            params: {
              inputTokenName: trade.inputTokenName,
              outputTokenName: trade.outputTokenName,
              inputAmount: trade.getInputAmount(),
              minimumOutputAmount: trade.getMinimumOutputAmount(),
            },
          },
        }),
      ),
    );
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
