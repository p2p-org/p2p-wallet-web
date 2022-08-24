import type { FC } from 'react';
import { useLayoutEffect } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import {
  CloseIcon,
  CloseWrapper,
  DateHeader,
  Header,
  Section,
  WrapperModal,
} from 'components/modals/TransactionInfoModals/common';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import type { ModalPropsType } from 'new/ui/modals/ModalManager';
import type { RawTransactionType } from 'new/ui/modals/ProcessTransactionModal/ProcessTransaction.Models';
import { HeaderLabel } from 'new/ui/modals/ProcessTransactionModal/Status/HeaderLabel';

import { ProcessTransactionModalViewModel } from './ProcessTransactionModal.ViewModel';

const Wrapper = styled.div``;

export interface ProcessTransactionModalProps {
  transaction: RawTransactionType;
}

export const ProcessTransactionModal: FC<ModalPropsType & ProcessTransactionModalProps> = observer(
  ({ close, transaction }) => {
    const viewModel = useViewModel(ProcessTransactionModalViewModel);

    useLayoutEffect(() => {
      viewModel.setTransaction(transaction);
      viewModel.sendAndObserveTransaction();
    });

    const handleCloseClick = () => {
      close(false);
    };

    return (
      <WrapperModal close={handleCloseClick}>
        <Section>
          <Header>
            1 → 2
            <CloseWrapper onClick={handleCloseClick}>
              <CloseIcon name="close" />
            </CloseWrapper>
            <DateHeader />
          </Header>
          <HeaderLabel viewModel={viewModel} />
        </Section>
      </WrapperModal>
    );
  },
);
