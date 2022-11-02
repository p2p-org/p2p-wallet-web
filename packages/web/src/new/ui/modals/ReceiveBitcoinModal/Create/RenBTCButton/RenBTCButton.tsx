import type { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { Button } from 'components/ui';
import { trackEvent } from 'new/sdk/Analytics';
import { Loader } from 'new/ui/components/common/Loader';
import type { ModalPropsType } from 'new/ui/modals/ModalManager';
import type { ReceiveBitcoinModalViewModel } from 'new/ui/modals/ReceiveBitcoinModal/ReceiveBitcoinModal.ViewModel';
import { numberToString } from 'new/utils/NumberExtensions';

interface Props {
  viewModel: Readonly<ReceiveBitcoinModalViewModel>;
}

export const RenBTCButton: FC<Props & ModalPropsType> = observer(({ viewModel, close }) => {
  const buttonText = expr(() => {
    const fee = viewModel.totalFee;
    const wallet = viewModel.payingWallet;
    if (!fee || !wallet || fee <= 0) {
      return 'Continue';
    }

    return `Pay ${numberToString(fee, { maximumFractionDigits: 9 })} ${
      wallet.token.symbol
    } & Continue`;
  });

  const handleClick = async () => {
    try {
      trackEvent({ name: 'Receive_Pay_Button' });

      await viewModel.createRenBTC();
      close(true);
    } catch {
      //
    }
  };

  return (
    <Button primary disabled={viewModel.isLoading} onClick={handleClick}>
      {viewModel.isLoading ? <Loader /> : buttonText}
    </Button>
  );
});
