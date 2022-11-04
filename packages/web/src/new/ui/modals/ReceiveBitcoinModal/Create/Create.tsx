import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { ButtonCancel } from 'components/common/ButtonCancel';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { ChooseWallet } from 'new/ui/components/common/ChooseWallet';
import type { ModalPropsType } from 'new/ui/modals/ModalManager';

import { List, Row, Section, WrapperModal } from '../common/styled';
import type { ReceiveBitcoinModalViewModel } from '../ReceiveBitcoinModal.ViewModel';
import { RenBTCButton } from './RenBTCButton';
import { WalletSelectorContent } from './WalletSelectorContent';

const ChooseWalletStyled = styled(ChooseWallet)`
  padding: 12px 20px;

  border: 1px solid ${theme.colors.stroke.secondary};
  border-radius: 12px;
`;

interface Props {
  viewModel: Readonly<ReceiveBitcoinModalViewModel>;
}

// TODO: show error
export const Create: FC<Props & ModalPropsType> = observer(({ viewModel, close }) => {
  const handleWalletChange = (wallet: Wallet) => {
    viewModel.walletDidSelect(wallet);
  };

  return (
    <WrapperModal
      title="Create Bitcoin address"
      iconName="clock"
      iconBgClassName="warning"
      close={() => close(false)}
      footer={
        <>
          <RenBTCButton viewModel={viewModel} close={close} />
          <ButtonCancel onClick={() => close(false)} />
        </>
      }
    >
      <Section>
        <List>
          <Row>
            Your wallet list does not contain a renBTC account, and to create one{' '}
            <strong>you need to make a transaction</strong>. You can choose which currency to pay in
            below.
          </Row>
        </List>
        <div style={{ position: 'relative' }}>
          <ChooseWalletStyled
            viewModel={viewModel.choosePayingWalletViewModel}
            selector={<WalletSelectorContent viewModel={viewModel} />}
            selectedWallet={viewModel.payingWallet}
            onWalletChange={handleWalletChange}
            staticWallets={viewModel.payableWallets}
            showOtherWallets={false}
          />
        </div>
        <List>
          <Row>
            You're going to create a public Bitcoin address that will be valid for the next{' '}
            <strong>24 hours</strong>. You still can hold and send Bitcoin without restrictions.
          </Row>
          <Row>
            It's a <strong>one-time address</strong>, so if you send multiple transactions, your
            money will be lost.
          </Row>
        </List>
      </Section>
    </WrapperModal>
  );
});
