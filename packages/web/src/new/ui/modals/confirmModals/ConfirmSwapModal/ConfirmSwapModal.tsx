import type { FC } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { Modal } from 'components/ui/Modal';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import type { SwapViewModel } from 'new/scenes/Main/Swap';
import { trackEvent } from 'new/sdk/Analytics';
import { ButtonCancel } from 'new/ui/components/common/ButtonCancel';
import { rounded } from 'new/utils/NumberExtensions';

import type { ModalPropsType } from '../../ModalManager';
import { ArrowDown } from '../common/ArrowDown';
import { SectionPassword } from '../common/SectionPassword';
import { Section } from '../common/styled';
import { ActionButton } from './ActionButton';
import { ConfirmSwapModalViewModel } from './ConfirmSwapModal.ViewModel';
import { DetailsView } from './DetailsView';
import { WalletView } from './WalletView';

const WrapperModal = styled(Modal)`
  flex-basis: 524px;
`;

const ModalTitle = styled.div`
  font-weight: 500;
  font-size: 24px;
  line-height: 140%;
  text-align: center;
`;

const ActionTitle = styled.div`
  padding: 16px;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 16px;
  letter-spacing: 0.01em;
`;

export interface ConfirmSwapModalProps {
  viewModel: Readonly<SwapViewModel>;
}

export const ConfirmSwapModal: FC<ConfirmSwapModalProps & ModalPropsType> = observer(
  ({ close, viewModel }) => {
    const vm = useViewModel(ConfirmSwapModalViewModel);
    vm.setSwapViewModel(viewModel);

    const [isDisabled, setIsDisabled] = useState(true);

    const handleCloseClick = () => {
      close(false);
    };

    const handleConfirmClick = () => {
      close(true);
      vm.authenticateAndSwap();

      // track button click
      trackEvent({
        name: 'Swap_Approve_Button',
        params: {
          Token_A: viewModel.sourceWallet!.token.symbol,
          Token_B: viewModel.destinationWallet!.token.symbol,
          Swap_Sum: rounded(viewModel.inputAmount!, viewModel.sourceWallet?.token.decimals || 9),
          Swap_MAX: viewModel.isUsingAllBalance,
          Swap_USD: rounded(viewModel.inputAmount! * viewModel.sourceWallet!.priceInCurrentFiat, 2),
        },
      });
    };

    const handleDisabledChange = (flag: boolean) => {
      setIsDisabled(flag);
    };

    return (
      <WrapperModal
        title={
          <ModalTitle>
            Confirm swapping {vm.sourceWallet?.token.symbol ?? ''} →{' '}
            {vm.destinationWallet?.token.symbol ?? ''}
          </ModalTitle>
        }
        close={handleCloseClick}
        footer={
          <>
            <ActionButton viewModel={vm} disabled={isDisabled} onClick={handleConfirmClick} />
            <ButtonCancel onClick={handleCloseClick} />
          </>
        }
        noDelimiter={false}
      >
        <ActionTitle>You are going to swap</ActionTitle>
        <Section className="swap">
          <div>
            <WalletView viewModel={vm} type="source" />
            <ArrowDown />
            <WalletView viewModel={vm} type="destination" />
          </div>
          <DetailsView viewModel={vm} />
        </Section>
        <SectionPassword onChange={handleDisabledChange} />
      </WrapperModal>
    );
  },
);
