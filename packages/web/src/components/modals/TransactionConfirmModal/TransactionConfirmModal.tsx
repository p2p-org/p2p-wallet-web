import type { FunctionComponent } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import {
  DEFAULT_WALLET_PROVIDERS,
  DefaultWalletType,
  useTryUnlockSeedAndMnemonic,
  useWallet,
} from '@p2p-wallet-web/core';

import type { ModalPropsType } from 'app/contexts/general/modals/types';
import { ErrorHint } from 'components/common/ErrorHint';
import { Modal } from 'components/common/Modal';
import { PasswordInput } from 'components/common/PasswordInput';
import { Button } from 'components/ui';

import { Section } from './common/styled';
import type { TransferParams } from './Send';
import { Send } from './Send';
import type { SwapParams } from './Swap';
import { Swap } from './Swap';

const WrapperModal = styled(Modal)`
  flex-basis: 588px;
`;

const SubTitle = styled.span`
  display: flex;

  margin-bottom: 12px;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;
`;

const PasswordInputStyled = styled(PasswordInput)`
  height: 46px;
`;

export type TransactionConfirmModalProps = {
  type: 'send' | 'swap';
  params: TransferParams | SwapParams;
};

export const TransactionConfirmModal: FunctionComponent<
  ModalPropsType & TransactionConfirmModalProps
> = ({ type, params, close }) => {
  const { walletProviderInfo } = useWallet();
  const tryUnlockSeedAndMnemonic = useTryUnlockSeedAndMnemonic();

  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);

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
    close(true);
  };

  const handleCloseClick = () => {
    close(false);
  };

  const isSecretKeyWallet =
    walletProviderInfo?.name === DEFAULT_WALLET_PROVIDERS[DefaultWalletType.SecretKey].name;
  const isDisabled = isSecretKeyWallet && (!password || hasError);

  const renderDescription = () => {
    switch (type) {
      case 'swap':
        return 'Swap transaction';
      case 'send':
        return 'Send transaction';
      default:
        return 'Transaction';
    }
  };

  const renderButtons = () => {
    let action;

    switch (type) {
      case 'swap':
        action = 'Confirm and swap';
        break;
      case 'send':
      default:
        action = 'Confirm and send';
        break;
    }

    return (
      <>
        <Button primary disabled={isDisabled} onClick={handleConfirmClick}>
          {action}
        </Button>
        <Button lightGray onClick={handleCloseClick}>
          Cancel
        </Button>
      </>
    );
  };

  return (
    <WrapperModal
      title="Double check and confirm"
      description={renderDescription()}
      close={handleCloseClick}
      footer={renderButtons()}
    >
      {type === 'send' ? <Send params={params as TransferParams} /> : undefined}
      {type === 'swap' ? <Swap params={params as SwapParams} /> : undefined}

      {isSecretKeyWallet ? (
        <Section>
          <SubTitle>Enter password to confirm</SubTitle>
          <PasswordInputStyled value={password} onChange={handlePasswordChange} />
          {hasError ? <ErrorHint error="Incorrect password, try again" noIcon /> : undefined}
        </Section>
      ) : undefined}
    </WrapperModal>
  );
};
