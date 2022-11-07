import type { FC } from 'react';
import { useLayoutEffect } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels';
import type { ImageViewType } from 'new/scenes/Main/WalletDetail/History/TransactionCollectionView/TransactionImageView';
import { TransactionImageView } from 'new/scenes/Main/WalletDetail/History/TransactionCollectionView/TransactionImageView';
import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import { Defaults } from 'new/services/Defaults';
import type { Fee } from 'new/ui/modals/TransactionModal/TransactionModal.ViewModal';
import { TransactionModalViewModel } from 'new/ui/modals/TransactionModal/TransactionModal.ViewModal';

import type { ModalPropsType } from '../../managers/ModalManager';
import { Modal } from '../Modal';
import { CopyImage } from './CopyImage';
import { SolanaExplorerLink } from './SolanaExplorerLink';

const WrapperModal = styled(Modal)`
  flex-basis: 524px;
`;

const ModalTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;

  line-height: 140%;
  letter-spacing: 0.01em;
`;

const TransactionImageViewStyled = styled(TransactionImageView)`
  margin-bottom: 12px;
`;

const AmountLabel = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-weight: 700;
  font-size: 16px;
`;

const USDAmountLabel = styled.div`
  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 20px;
`;

const BlockTimeLabel = styled.div`
  color: ${theme.colors.textIcon.secondary};
  font-size: 14px;
`;

const Content = styled.div`
  display: grid;
  grid-gap: 23px;
  padding: 16px 30px;
`;

const FieldWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const FieldTitle = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
`;

const FieldValue = styled.div`
  color: ${theme.colors.textIcon.secondary};
  font-size: 16px;
`;

const FeeLabel = styled.div`
  &.blue {
    color: ${theme.colors.textIcon.active};
  }
`;

const StatusLabel = styled.div`
  &.pending {
    color: #ffa631;
  }

  &.completed {
    color: #77db7c;
  }

  &.error {
    color: #f43d3d;
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export type Model = {
  imageType: { imageType: ImageViewType; statusImage: string | null };
  amount: string | null;
  usdAmount: string | null;
  blockTime: string;
  transactionId: string;
  address: string | null;
  addresses: { from: string | null; to: string | null };
  username: string | null;
  fee: Fee;
  status: Status;
};

type Status = {
  text: string;
  color: string;
};

export interface TransactionModalProps {
  transaction: ParsedTransaction;
}

// TODO: skeleton instead return null
// TODO: username view
export const TransactionModal: FC<TransactionModalProps & ModalPropsType> = observer(
  ({ close, transaction }) => {
    const viewModel = useViewModel(TransactionModalViewModel);

    useLayoutEffect(() => {
      viewModel.setTransaction(transaction);
    }, [transaction]);

    const handleCloseClick = () => {
      close(false);
    };

    const model = viewModel.model;

    if (!model) {
      return null;
    }

    return (
      <WrapperModal
        title={
          <ModalTitle>
            <TransactionImageViewStyled
              imageView={model.imageType.imageType}
              statusImage={model.imageType.statusImage}
            />
            {model.amount ? <AmountLabel>{model.amount}</AmountLabel> : null}
            {model.usdAmount ? <USDAmountLabel>{model.usdAmount}</USDAmountLabel> : null}
            <BlockTimeLabel>{model.blockTime}</BlockTimeLabel>
          </ModalTitle>
        }
        close={handleCloseClick}
        footer={
          <Footer>
            <SolanaExplorerLink
              signature={model.transactionId}
              network={Defaults.apiEndpoint.network}
            />
          </Footer>
        }
        noDelimiter={false}
      >
        <Content>
          {model.username ? (
            <FieldWrapper>
              <FieldTitle>Username</FieldTitle>
              <FieldValue onClick={() => viewModel.copyUsername()}>
                {model.username} <CopyImage />
              </FieldValue>
            </FieldWrapper>
          ) : null}
          {model.address ? (
            <FieldWrapper>
              <FieldTitle>Address</FieldTitle>
              <FieldValue onClick={() => viewModel.copyAddress('address')}>
                {model.address} <CopyImage />
              </FieldValue>
            </FieldWrapper>
          ) : null}
          {model.addresses.from ? (
            <FieldWrapper>
              <FieldTitle>From</FieldTitle>
              <FieldValue onClick={() => viewModel.copyAddress('addresses.from')}>
                {model.addresses.from} <CopyImage />
              </FieldValue>
            </FieldWrapper>
          ) : null}
          {model.addresses.to ? (
            <FieldWrapper>
              <FieldTitle>To</FieldTitle>
              <FieldValue onClick={() => viewModel.copyAddress('addresses.to')}>
                {model.addresses.to} <CopyImage />
              </FieldValue>
            </FieldWrapper>
          ) : null}
          <FieldWrapper>
            <FieldTitle>Fee</FieldTitle>
            <FieldValue>
              <FeeLabel className={model.fee.color}>{model.fee.text}</FeeLabel>
            </FieldValue>
          </FieldWrapper>
          <FieldWrapper>
            <FieldTitle>Status</FieldTitle>
            <FieldValue>
              <StatusLabel className={model.status.color}>{model.status.text}</StatusLabel>
            </FieldValue>
          </FieldWrapper>
          <FieldWrapper>
            <FieldTitle>Transaction ID</FieldTitle>
            <FieldValue onClick={() => viewModel.copyTransactionId()}>
              {model.transactionId} <CopyImage />
            </FieldValue>
          </FieldWrapper>
        </Content>
      </WrapperModal>
    );
  },
);
