import type { FC } from 'react';
import { useLayoutEffect } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

// TODO: relocate
import {
  CloseIcon,
  CloseWrapper,
  Header,
  WrapperModal,
} from 'components/modals/TransactionInfoModals/common';
import { Button } from 'components/ui';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import type { ModalPropsType } from 'new/ui/modals/ModalManager';
import { TransactionID } from 'new/ui/modals/ProcessTransactionModal/Status/TransactionID';

import type { RawTransactionType } from './ProcessTransaction.Models';
import { ProcessTransactionModalViewModel } from './ProcessTransactionModal.ViewModel';
import { HeaderLabel } from './Status/HeaderLabel';
import { ProgressView } from './Status/ProgressView';

const PaddedHeader = styled(Header)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 12px 20px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  padding: 18px 20px;
`;

const Description = styled.div`
  display: flex;
  justify-content: center;

  color: ${theme.colors.textIcon.secondary};

  font-weight: 500;
  font-size: 14px;
  line-height: 120%;
`;

export interface ProcessTransactionModalProps {
  transaction: RawTransactionType;
}

// TODO: Green alert (shown only when top up is finished but transaction is not)
export const ProcessTransactionModal: FC<ProcessTransactionModalProps & ModalPropsType> = observer(
  ({ close, transaction }) => {
    const viewModel = useViewModel(ProcessTransactionModalViewModel);
    // set transaction before, to available all getters under
    if (!viewModel.rawTransaction) {
      viewModel.setTransaction(transaction);
    }

    useLayoutEffect(() => {
      return viewModel.sendAndObserveTransaction();
    }, []);

    const handleCloseClick = () => {
      close(false);
    };

    return (
      <WrapperModal close={handleCloseClick}>
        <PaddedHeader>
          <HeaderLabel viewModel={viewModel} />
          {/*{viewModel.getMainDescription}*/}
          <CloseWrapper onClick={handleCloseClick}>
            <CloseIcon name="close" />
          </CloseWrapper>
          <Description>{viewModel.getMainDescription}</Description>
          {/*<DateView viewModel={viewModel} />*/}
        </PaddedHeader>
        <ProgressView viewModel={viewModel} /*label={'Swap status:'}*/ />
        {/*<Section>*/}
        {/*  {viewModel.observingTransactionIndex !== null &&*/}
        {/*  typeof viewModel.observingTransactionIndex !== 'undefined' ? (*/}
        {/*    <TransactionDetail observingTransactionIndex={viewModel.observingTransactionIndex} />*/}
        {/*  ) : null}*/}
        {/*</Section>*/}
        {viewModel.transactionID ? (
          <Section>
            <TransactionID transactionID={viewModel.transactionID} />
          </Section>
        ) : null}
        <Section>
          <Button primary onClick={handleCloseClick}>
            Done
          </Button>
        </Section>
        {/*{viewModel.transactionID ? (*/}
        {/*  <SolanaExplorerLink signature={viewModel.transactionID} />*/}
        {/*) : null}*/}
      </WrapperModal>
    );
  },
);
