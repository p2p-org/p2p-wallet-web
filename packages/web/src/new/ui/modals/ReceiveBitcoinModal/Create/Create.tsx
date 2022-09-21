import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { ButtonCancel } from 'components/common/ButtonCancel';
import { Button } from 'components/ui';
import { convertToBalance } from 'new/sdk/SolanaSDK';
import { Loader } from 'new/ui/components/common/Loader';
import type { ModalPropsType } from 'new/ui/modals/ModalManager';
import { numberToTokenString } from 'new/utils/NumberExtensions';

import { List, Row, Section, WrapperModal } from '../common/styled';
import type { ReceiveBitcoinModalViewModel } from '../ReceiveBitcoinModal.ViewModel';

type Props = { viewModel: ReceiveBitcoinModalViewModel };

export const Create: FC<ModalPropsType & Props> = observer(({ viewModel, close }) => {
  const feeInTokenString =
    viewModel.totalFee && viewModel.payingWallet
      ? numberToTokenString(
          convertToBalance(viewModel.totalFee, viewModel.payingWallet.token.decimals),
          viewModel.payingWallet.token,
        )
      : '';
  const buttonText = `Pay ${feeInTokenString} & Continue`;

  const handleCreateAccountClick = async () => {
    try {
      await viewModel.createRenBTC();
      close(true);
    } catch (error) {
      viewModel.errorNotification((error as Error).message);
      console.error(error);
    }
  };

  return (
    <WrapperModal
      title="Receiving via Bitcoin network"
      description="Make sure you understand these aspects"
      iconName="clock"
      iconBgClassName="warning"
      close={() => close(false)}
      footer={
        <>
          <Button primary disabled={viewModel.isLoading} onClick={handleCreateAccountClick}>
            {viewModel.isLoading ? <Loader /> : buttonText}
          </Button>
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
