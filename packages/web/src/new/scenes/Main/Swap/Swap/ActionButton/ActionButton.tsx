import type { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { Button } from 'components/ui';
import { VerificationError } from 'new/scenes/Main/Swap/Swap/types';

import type { SwapViewModel } from '../Swap.ViewModel';

interface Props {
  viewModel: Readonly<SwapViewModel>;
}

export const ActionButton: FC<Props> = observer(({ viewModel }) => {
  const isDisabled = Boolean(viewModel.error);

  const handleClick = () => {
    void viewModel.openConfirmModal();
  };

  // setError
  const error = expr(() => {
    const error = viewModel.error;
    const feePayingTokenSymbol = viewModel.payingWallet?.token.symbol; // feePayingToken

    let text: string;

    switch (error) {
      case VerificationError.swappingIsNotAvailable:
        text = 'Swapping is currently unavailable';
        break;
      case VerificationError.sourceWalletIsEmpty:
        text = 'Choose source wallet';
        break;
      case VerificationError.destinationWalletIsEmpty:
        text = 'Choose destination wallet';
        break;
      case VerificationError.canNotSwapToItSelf:
        text = 'Choose another destination wallet';
        break;
      case VerificationError.tradablePoolsPairsNotLoaded:
        text = 'Loading';
        break;
      case VerificationError.tradingPairNotSupported:
        text = 'This trading pair is not supported';
        break;
      case VerificationError.feesIsBeingCalculated:
        text = 'Calculating fees';
        break;
      case VerificationError.couldNotCalculatingFees:
        text = 'Could not calculating fees';
        break;
      case VerificationError.inputAmountIsEmpty:
        text = 'Enter the amount';
        break;
      case VerificationError.inputAmountIsNotValid:
        text = 'Input amount is not valid';
        break;
      case VerificationError.insufficientFunds:
        text = 'Insufficient funds';
        break;
      case VerificationError.estimatedAmountIsNotValid:
        text = 'Amount is too small';
        break;
      case VerificationError.bestPoolsPairsIsEmpty:
        text = 'This trading pair is not supported';
        break;
      case VerificationError.slippageIsNotValid:
        text = 'Choose another slippage';
        break;
      case VerificationError.nativeWalletNotFound:
        text = 'Could not connect to wallet';
        break;
      case VerificationError.notEnoughSOLToCoverFees:
        text = 'Your account does not have enough SOL to cover fee';
        break;
      case VerificationError.notEnoughBalanceToCoverFees:
        text = `Your account does not have enough ${feePayingTokenSymbol ?? ''} to cover fees`;
        break;
      case VerificationError.unknown:
        text = 'Unknown error';
        break;
      case VerificationError.payingFeeWalletNotFound:
        // TODO: fix
        text = 'payingFeeWalletNotFound';
        break;
      default:
        text = 'Review & confirm';
        break;
    }

    return text;
  });

  return (
    <Button primary full disabled={isDisabled} onClick={handleClick}>
      {error}
    </Button>
  );
});
