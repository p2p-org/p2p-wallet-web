import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { Loader } from 'new/ui/components/common/Loader';
import type { ModalPropsType } from 'new/ui/modals/ModalManager';
import { WrapperModal } from 'new/ui/modals/ReceiveBitcoinModal/common/styled';
import { Create } from 'new/ui/modals/ReceiveBitcoinModal/Create';
import {
  ReceiveBitcoinModalViewModel,
  RenBTCAccountStatus,
} from 'new/ui/modals/ReceiveBitcoinModal/ReceiveBitcoinModal.ViewModel';
import { TopUp } from 'new/ui/modals/ReceiveBitcoinModal/TopUp';

const LoaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 300px;
`;

export const ReceiveBitcoinModal: FC<ModalPropsType> = observer((props) => {
  const viewModel = useViewModel(ReceiveBitcoinModalViewModel);

  if (viewModel.isLoading) {
    return (
      <WrapperModal close={() => {}}>
        <LoaderWrapper>
          <Loader size="100" />
        </LoaderWrapper>
      </WrapperModal>
    );
  }

  if (viewModel.accountStatus === RenBTCAccountStatus.topUpRequired) {
    return <TopUp close={props.close} />;
  }

  return <Create close={props.close} />;
});
