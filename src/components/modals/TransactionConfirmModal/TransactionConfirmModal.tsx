import React, { FunctionComponent, useState } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { WalletType } from 'api/wallet';
import { loadMnemonicAndSeed } from 'api/wallet/ManualWallet';
import { ERROR_WRONG_PASSWORD } from 'api/wallet/ManualWallet/errors';
import { AddressText } from 'components/common/AddressText';
import { ErrorHint } from 'components/common/ErrorHint';
import { Modal } from 'components/common/Modal';
import { PasswordInput } from 'components/common/PasswordInput';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Button, Icon } from 'components/ui';

const WrapperModal = styled(Modal)`
  flex-basis: 588px;
`;

const Section = styled.div`
  padding: 20px;

  &.swap {
    padding: 20px 20px 0;
  }

  &.send {
    padding: 0 20px;
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
`;

const SectionTitle = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

const FieldInfo = styled.div`
  display: flex;
  padding: 20px 0;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
`;

const WalletIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: #f6f6f8;
  border-radius: 12px;
`;

const InfoWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin: 0 9px 0 12px;
`;

const InfoTitle = styled.div`
  margin-bottom: 2px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
`;

const Username = styled(InfoTitle)`
  font-size: 16px;
  color: #000;
`;

const InfoValue = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 16px;
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

type TransferParams = {
  source: TokenAccount;
  destination: string;
  username?: string;
  amount: number;
};

type SwapParams = {
  firstToken: Token;
  firstTokenAccount: TokenAccount;
  secondToken: Token;
  secondTokenAccount: TokenAccount;
  firstAmount: number;
  secondAmount: number;
};

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
      {type === 'send' ? (
        <Section className="send">
          <FieldInfo>
            <TokenAvatar
              symbol={(params as TransferParams).source.mint.symbol}
              address={(params as TransferParams).source.mint.address.toBase58()}
              size={44}
            />
            <InfoWrapper>
              <InfoTitle>Check the amount</InfoTitle>
              <InfoValue>
                {(params as TransferParams).amount} {(params as TransferParams).source.mint.symbol}
              </InfoValue>
            </InfoWrapper>
          </FieldInfo>
          <FieldInfo>
            <IconWrapper>
              <WalletIcon name="wallet" />
            </IconWrapper>
            <InfoWrapper>
              {(params as TransferParams).username ? (
                <Username>{(params as TransferParams).username}</Username>
              ) : (
                <InfoTitle>Check recepient’s address</InfoTitle>
              )}
              <InfoValue>
                <AddressText address={(params as TransferParams).destination} medium />
              </InfoValue>
            </InfoWrapper>
          </FieldInfo>
        </Section>
      ) : undefined}

      {type === 'swap' ? (
        <>
          <Section className="swap">
            <SectionTitle>From</SectionTitle>
            <FieldInfo>
              <TokenAvatar
                symbol={(params as SwapParams).firstToken.symbol}
                address={(params as SwapParams).firstToken.address.toBase58()}
                size={44}
              />
              <InfoWrapper>
                <InfoTitle>Check the amount</InfoTitle>
                <InfoValue>
                  {(params as SwapParams).firstToken
                    .toMajorDenomination((params as SwapParams).firstAmount)
                    .toNumber()}{' '}
                  {(params as SwapParams).firstToken.symbol}
                </InfoValue>
              </InfoWrapper>
            </FieldInfo>
          </Section>
          <Section className="top">
            <SectionTitle>To</SectionTitle>
            <FieldInfo>
              <TokenAvatar
                symbol={(params as SwapParams).secondToken.symbol}
                address={(params as SwapParams).secondToken.address.toBase58()}
                size={44}
              />
              <InfoWrapper>
                <InfoTitle>Minimum receive</InfoTitle>
                <InfoValue>
                  {(params as SwapParams).secondToken
                    .toMajorDenomination((params as SwapParams).secondAmount)
                    .toNumber()}{' '}
                  {(params as SwapParams).secondToken.symbol}
                </InfoValue>
              </InfoWrapper>
            </FieldInfo>
            <FieldInfo>
              <IconWrapper>
                <WalletIcon name="wallet" />
              </IconWrapper>
              <InfoWrapper>
                <InfoTitle>Destination wallet</InfoTitle>
                <InfoValue>
                  {(params as SwapParams).secondTokenAccount
                    ? (params as SwapParams).secondTokenAccount.address.toBase58()
                    : 'Will be created after transaction processing'}
                </InfoValue>
              </InfoWrapper>
            </FieldInfo>
          </Section>
        </>
      ) : undefined}
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
