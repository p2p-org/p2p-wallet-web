import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { Layout } from 'components/common/Layout';
import {
  CloseIcon,
  CloseWrapper,
  DateHeader,
  Header,
  Section,
  WrapperModal,
} from 'components/modals/TransactionInfoModals/common';
import { useViewModel } from 'new/core/viewmodels/useViewModel';

import { ProcessTransactionViewModel } from './ProcessTransaction.ViewModel';

const Wrapper = styled.div``;

interface Props {}

export const ProcessTransaction: FC<Props> = observer((props) => {
  const viewModel = useViewModel(ProcessTransactionViewModel);

  const handleCloseClick = () => {};

  return (
    <Layout>
      <WrapperModal close={handleCloseClick}>
        <Section>
          <Header>
            1 → 2
            <CloseWrapper onClick={handleCloseClick}>
              <CloseIcon name="close" />
            </CloseWrapper>
            <DateHeader />
          </Header>
        </Section>
      </WrapperModal>
    </Layout>
  );
});
