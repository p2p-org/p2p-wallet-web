import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';

import { styled } from '@linaria/react';
import {
  DEFAULT_WALLET_PROVIDERS,
  DefaultWalletType,
  useTryUnlockSeedAndMnemonic,
  useWallet,
} from '@p2p-wallet-web/core';
import { theme } from '@p2p-wallet-web/ui';

import type { ModalPropsType } from 'app/contexts/general/modals/types';
import { ButtonCancel } from 'components/common/ButtonCancel';
import { ErrorHint } from 'components/common/ErrorHint';
import { PasswordInput } from 'components/common/PasswordInput';
import type { TransactionDetailsProps } from 'components/common/TransactionDetails';
import { Button, Icon } from 'components/ui';
import { Modal } from 'components/ui/Modal';
import { trackEvent } from 'utils/analytics';

import { Section } from './common/styled';
import type { TransferParams } from './Send';
import { Send } from './Send';
import type { SwapParams } from './Swap';
import { Swap } from './Swap';

const WrapperModal = styled(Modal)`
  flex-basis: 524px;
`;

const ModalTitle = styled.div`
  font-weight: 500;
  font-size: 24px;
  line-height: 140%;
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

export type TransactionConfirmModalProps = TransactionDetailsProps & {
  type: 'send' | 'swap';
  params: TransferParams | SwapParams;
};

export const TransactionConfirmModal: FunctionComponent<
  ModalPropsType & TransactionConfirmModalProps
> = ({ type, params, close, sendState, userFreeFeeLimits }) => {
  const { walletProviderInfo } = useWallet();
  const tryUnlockSeedAndMnemonic = useTryUnlockSeedAndMnemonic();

  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (type === 'send') {
      trackEvent('Send_Reviewing');
    }
  }, []);

  const validatePassword = async (password: string) => {
    try {
      await tryUnlockSeedAndMnemonic(password);
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
    if (type === 'send') {
      trackEvent('Send_Verification_Invoked');
    }

    close(true);
  };

  const handleCloseClick = () => {
    close(false);
  };

  const isSecretKeyWallet =
    walletProviderInfo?.name === DEFAULT_WALLET_PROVIDERS[DefaultWalletType.SecretKey].name;
  const isDisabled = isSecretKeyWallet && (!password || hasError);

  const renderTitle = () => {
    switch (type) {
      case 'send':
        return (
          <ModalTitle>
            Confirm sending {(params as TransferParams).source.balance?.token.symbol}
          </ModalTitle>
        );
      default:
        return 'Double check and confirm';
    }
  };

  const renderDescription = () => {
    switch (type) {
      case 'swap':
        return 'Swap transaction';
      default:
        return null;
    }
  };

  const renderButtons = () => {
    let action;

    switch (type) {
      case 'swap':
        action = 'Confirm and send';
        break;
      case 'send':
      default:
        action = (
          <>
            <SendIcon name="top" />
            Send {(params as TransferParams).amount.formatUnits()}
          </>
        );
        break;
    }

    return (
      <>
        <Button
          primary
          disabled={isDisabled}
          onClick={handleConfirmClick}
          style={{ width: '314px' }}
        >
          {action}
        </Button>
        <ButtonCancel onClick={handleCloseClick} style={{ width: '154px' }} />
      </>
    );
  };

  return (
    <WrapperModal
      title={renderTitle()}
      description={renderDescription()}
      close={handleCloseClick}
      footer={renderButtons()}
    >
      {type === 'send' ? <ActionTitle>You are going to send</ActionTitle> : undefined}
      {type === 'send' ? (
        <Send
          params={params as TransferParams}
          sendState={sendState}
          userFreeFeeLimits={userFreeFeeLimits}
        />
      ) : undefined}
      {type === 'swap' ? <Swap params={params as SwapParams} /> : undefined}

      {isSecretKeyWallet ? (
        <Section className="password">
          <SubTitle>Enter password to confirm</SubTitle>
          <PasswordInputStyled value={password} onChange={handlePasswordChange} />
          {hasError ? <ErrorHint error="Incorrect password, try again" noIcon /> : undefined}
        </Section>
      ) : undefined}
    </WrapperModal>
  );
};
