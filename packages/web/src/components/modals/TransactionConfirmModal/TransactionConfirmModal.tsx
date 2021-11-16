import type { FunctionComponent } from 'react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import { WalletType } from 'api/wallet';
import { loadMnemonicAndSeed } from 'api/wallet/ManualWallet';
import { ERROR_WRONG_PASSWORD } from 'api/wallet/ManualWallet/errors';
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

type Props = {
  type: 'send' | 'swap';
  params: TransferParams | SwapParams;
  close: (isConfirm?: boolean) => void;
};

export const TransactionConfirmModal: FunctionComponent<Props> = ({ type, params, close }) => {
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);
  const walletType = useSelector((state) => state.wallet.type);

  const validatePassword = async (value: string) => {
    try {
      await loadMnemonicAndSeed(value);
      setHasError(false);
    } catch (error) {
      if ((error as Error).message === ERROR_WRONG_PASSWORD) {
        setHasError(true);
      }
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

  const isDisabled = walletType === WalletType.MANUAL && (!password || hasError);

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
      footer={renderButtons()}>
      {type === 'send' ? <Send params={params as TransferParams} /> : undefined}
      {type === 'swap' ? <Swap params={params as SwapParams} /> : undefined}

      {walletType === WalletType.MANUAL ? (
        <Section>
          <SubTitle>Enter password to confirm</SubTitle>
          <PasswordInputStyled value={password} onChange={handlePasswordChange} />
          {hasError ? <ErrorHint error="Incorrect password, try again" noIcon /> : undefined}
        </Section>
      ) : undefined}
    </WrapperModal>
  );
};
