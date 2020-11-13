import React, { FunctionComponent } from 'react';

import * as web3 from '@solana/web3.js';
import { styled } from 'linaria/react';

import { Modal } from 'components/common/Modal';
import { QRAddressWidget } from 'components/common/QRAddressWidget';

const WrapperModal = styled(Modal)`
  flex-basis: 461px;
`;

const Content = styled.div`
  padding: 20px 30px 38px;
`;

/* TODO: need to use QRAddressWidgetStyled but it cause build error */
/*
const QRAddressWidgetStyled = styled(QRAddressWidget)`
  background: #F0F0F0;
`;
 */

type Props = {
  publicKey: web3.PublicKey;
  isSol?: boolean;
  close: () => void;
};

export const RecieveTokensModal: FunctionComponent<Props> = ({ publicKey, isSol, close }) => {
  return (
    <WrapperModal title="Recieve tokens" close={close}>
      <Content>
        <QRAddressWidget publicKey={publicKey} isSol={isSol} />
      </Content>
    </WrapperModal>
  );
};
