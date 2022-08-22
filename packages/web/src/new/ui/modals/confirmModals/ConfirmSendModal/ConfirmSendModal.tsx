import type { FC } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import {
  DEFAULT_WALLET_PROVIDERS,
  DefaultWalletType,
  useTryUnlockSeedAndMnemonic,
  useWallet,
} from '@p2p-wallet-web/core';
import { theme } from '@p2p-wallet-web/ui';

import { ButtonCancel } from 'components/common/ButtonCancel';
import { ErrorHint } from 'components/common/ErrorHint';
import { PasswordInput } from 'components/common/PasswordInput';
import { Button, Icon } from 'components/ui';
import { Modal } from 'components/ui/Modal';
import type { SendViewModel } from 'new/scenes/Main/Send';
import { numberToString } from 'new/utils/NumberExtensions';

import type { ModalPropsType } from '../../ModalManager';
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

const ArrowWrapper = styled.div`
  position: relative;

  height: 16px;
  margin-left: 26px;
`;

const ArrowIconWrapper = styled.div`
  position: relative;
  top: -8px;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  color: ${theme.colors.textIcon.active};

  background: ${theme.colors.bg.primary};
  border: 1px solid ${theme.colors.stroke.secondary};
  border-radius: 12px;

  &::before,
  &::after {
    position: absolute;

    width: 1px;
    height: 16px;

    background: ${theme.colors.bg.primary};

    content: '';
  }

  &::before {
    left: -1px;
  }

  &::after {
    right: -1px;
  }
`;

const ArrowIcon = styled(Icon)`
  width: 16px;
  height: 16px;
`;

export interface ConfirmSendModalProps {
  viewModel: Readonly<SendViewModel>;
}

export const ConfirmSendModal: FC<ModalPropsType & ConfirmSendModalProps> = ({
  close,
  viewModel,
}) => {
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
      title={<ModalTitle>Confirm sending</ModalTitle>}
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
          <ArrowWrapper>
            <ArrowIconWrapper>
              <ArrowIcon name="arrow-down" />
            </ArrowIconWrapper>
          </ArrowWrapper>
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
};
