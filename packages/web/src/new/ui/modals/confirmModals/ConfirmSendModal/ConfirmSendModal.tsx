import type { FC } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import { ZERO } from '@orca-so/sdk';
import {
  DEFAULT_WALLET_PROVIDERS,
  DefaultWalletType,
  useTryUnlockSeedAndMnemonic,
  useWallet,
} from '@p2p-wallet-web/core';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { Button, Icon } from 'components/ui';
import { Modal } from 'components/ui/Modal';
import type { SendViewModel } from 'new/scenes/Main/Send';
import { trackEvent } from 'new/sdk/Analytics';
import { ButtonCancel } from 'new/ui/components/common/ButtonCancel';
import { ErrorHint } from 'new/ui/components/common/ErrorHint';
import { PasswordInput } from 'new/ui/components/common/PasswordInput';
import { numberToString, rounded } from 'new/utils/NumberExtensions';
import { capitalizeFirstLetter } from 'new/utils/StringExtensions';

import type { ModalPropsType } from '../../ModalManager';
import { ArrowDown } from '../common/ArrowDown';
import { Section } from '../common/styled';
import { AmountSummaryView } from './AmountSummaryView';
import { RecipientView } from './RecipientView';

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

const PasswordInputStyled = styled(PasswordInput)`
  height: 46px;
`;

const SendIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;

export interface ConfirmSendModalProps {
  viewModel: Readonly<SendViewModel>;
}

export const ConfirmSendModal: FC<ConfirmSendModalProps & ModalPropsType> = observer(
  ({ close, viewModel }) => {
    const { walletProviderInfo } = useWallet();
    const tryUnlockSeedAndMnemonic = useTryUnlockSeedAndMnemonic();

    const [password, setPassword] = useState('');
    const [hasError, setHasError] = useState(false);

    const handleCloseClick = () => {
      close(false);
    };

    const validatePassword = async (value: string) => {
      try {
        await tryUnlockSeedAndMnemonic(value);
        setHasError(false);
      } catch (error) {
        setHasError(true);
      }
    };

    const handlePasswordChange = (value: string) => {
      setPassword(value);

      if (value) {
        void validatePassword(value);
      }
    };

    const handleConfirmClick = () => {
      close(true);
      viewModel.authenticateAndSend();

      // track confirm button clicked
      const amountInFiat = rounded(viewModel.amount * viewModel.wallet!.priceInCurrentFiat, 2);

      let feeToken: string | null = null;
      const value = viewModel.feeInfo.value;
      const payingWallet = viewModel.payingWallet;
      if (value?.hasAvailableWalletToPayFee && payingWallet) {
        if (value.feeAmount.total.gt(ZERO)) {
          feeToken = payingWallet.token.symbol;
        }
      }

      trackEvent({
        name: 'Send_Confirm_Button_Pressed',
        params: {
          Send_Network: capitalizeFirstLetter(viewModel.network),
          Send_Currency: viewModel.wallet!.token.symbol,
          Send_Sum: viewModel.amount,
          Send_MAX: viewModel.maxWasClicked,
          Send_USD: amountInFiat,
          Send_Free: viewModel.feeInfo.value?.feeAmount.transaction.eq(ZERO) || false,
          Send_Username: Boolean(viewModel.recipient?.name),
          Send_Account_Fee_Token: feeToken,
        },
      });
    };

    const isSecretKeyWallet =
      walletProviderInfo?.name === DEFAULT_WALLET_PROVIDERS[DefaultWalletType.SecretKey].name;
    const isDisabled =
      (isSecretKeyWallet && (!password || hasError)) ||
      !viewModel.wallet ||
      !viewModel.amount ||
      !viewModel.recipient;

    // const address = params.destination?.toBase58?.() || btcAddress;
    // const isFullName = /\w*\.\w+/.test(params.username || '');

    return (
      <WrapperModal
        title={<ModalTitle>Confirm sending {viewModel.wallet?.token.symbol ?? ''}</ModalTitle>}
        close={handleCloseClick}
        footer={
          <>
            <Button primary disabled={isDisabled} onClick={handleConfirmClick}>
              <SendIcon name="top" />
              {viewModel.error?.buttonSuggestion ??
                `Send ${numberToString(viewModel.amount, {
                  maximumFractionDigits: 9,
                })} ${viewModel.wallet?.token.symbol ?? ''}`}
            </Button>
            <ButtonCancel onClick={handleCloseClick} />
          </>
        }
        noDelimiter={false}
      >
        <ActionTitle>You are going to send</ActionTitle>

        <Section className="send">
          <div>
            <AmountSummaryView viewModel={viewModel} />
            <ArrowDown />
            <RecipientView viewModel={viewModel} />
          </div>

          {/*<TransactionDetails sendState={sendState} amount={params.amount} />*/}
        </Section>

        {isSecretKeyWallet ? (
          <Section className="password">
            <SubTitle>Enter password to confirm</SubTitle>
            <PasswordInputStyled
              value={password}
              onChange={handlePasswordChange}
              isError={hasError}
            />
            {hasError ? <ErrorHint error="The password is not correct" noIcon /> : null}
          </Section>
        ) : null}
      </WrapperModal>
    );
  },
);
