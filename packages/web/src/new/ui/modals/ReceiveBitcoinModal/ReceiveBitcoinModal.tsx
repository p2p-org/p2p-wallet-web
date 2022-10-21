import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { Loader } from 'new/ui/components/common/Loader';
import type { ModalPropsType } from 'new/ui/modals/ModalManager';

import { LoaderWrapper, WrapperModal } from './common/styled';
import { Create } from './Create';
import { ReceiveBitcoinModalViewModel, RenBTCAccountStatus } from './ReceiveBitcoinModal.ViewModel';
import { TopUp } from './TopUp';

const LoaderWrapperStyled = styled(LoaderWrapper)`
  height: 300px;
`;

export const ReceiveBitcoinModal: FC<ModalPropsType> = observer(({ close }) => {
  const viewModel = useViewModel(ReceiveBitcoinModalViewModel);

  if (viewModel.isLoading || !viewModel.accountStatus) {
    return (
      <WrapperModal close={() => close(false)}>
        <LoaderWrapperStyled>
          <Loader size="100" />
        </LoaderWrapperStyled>
      </WrapperModal>
    );
  }

  switch (viewModel.accountStatus) {
    case RenBTCAccountStatus.topUpRequired:
      return <TopUp close={close} />;
    case RenBTCAccountStatus.payingWalletAvailable:
      return <Create viewModel={viewModel} close={close} />;
  }
});
