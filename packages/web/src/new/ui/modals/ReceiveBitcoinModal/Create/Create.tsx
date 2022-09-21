import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { ButtonCancel } from 'components/common/ButtonCancel';
import type { ModalPropsType } from 'new/ui/modals/ModalManager';
import { RenBTCButton } from 'new/ui/modals/ReceiveBitcoinModal/Create/RenBTCButton';

import { List, Row, Section, WrapperModal } from '../common/styled';
import type { ReceiveBitcoinModalViewModel } from '../ReceiveBitcoinModal.ViewModel';

interface Props {
  viewModel: Readonly<ReceiveBitcoinModalViewModel>;
}

export const Create: FC<Props & ModalPropsType> = observer(({ viewModel, close }) => {
  return (
    <WrapperModal
      title="Receiving via Bitcoin network"
      description="Make sure you understand these aspects"
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
        {viewModel.payingWallet?.token.symbol}

        {/*<Feature name={FEATURE_PAY_BY}>
          <FeePaySelector
            tokenAccounts={tokenAccounts}
            onTokenAccountChange={handleFeeTokenAccountChange}
            isShortList
          />
        </Feature>*/}

        <List>
          <Row>
            This address accepts <strong>only Bitcoin</strong>. You may lose assets by sending
            another coin.
          </Row>
          <Row>
            Minimum transaction amount of <strong>0.000112 BTC</strong>.
          </Row>
          <Row>
            <strong>
              {/*<HMSCountdown milliseconds={getRemainingGatewayTime(expiryTime)} />*/}
              35:59:59
            </strong>
            &nbsp; is the remaining time to safely send the assets
          </Row>
        </List>
      </Section>
    </WrapperModal>
  );
});
