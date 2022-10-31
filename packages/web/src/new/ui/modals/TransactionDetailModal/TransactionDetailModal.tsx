import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { Button, Icon } from 'components/ui';
import { Modal } from 'components/ui/Modal';
import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import { ButtonCancel } from 'new/ui/components/common/ButtonCancel';

import type { ModalPropsType } from '../../managers/ModalManager';

const WrapperModal = styled(Modal)`
  flex-basis: 524px;
`;

const ModalTitle = styled.div`
  font-weight: 500;
  font-size: 24px;
  line-height: 140%;
  text-align: center;
`;

const SubTitle = styled.span`
  display: flex;
  margin-bottom: 8px;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

const ActionTitle = styled.div`
  padding: 16px 0 0 16px;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

const SendIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;

export interface ConfirmSendModalProps {
  transaction: ParsedTransaction;
}

export const TransactionDetailModal: FC<ModalPropsType> = observer(({ close, transaction }) => {
  const handleCloseClick = () => {
    close(false);
  };

  return (
    <WrapperModal
      title={<ModalTitle>123</ModalTitle>}
      close={handleCloseClick}
      footer={
        <>
          <Button>
            <SendIcon name="top" />
            123
          </Button>
          <ButtonCancel />
        </>
      }
      noDelimiter={false}
    >
      111
    </WrapperModal>
  );
});
