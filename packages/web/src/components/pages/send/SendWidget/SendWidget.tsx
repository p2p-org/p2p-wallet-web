import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { useSolana, useUserTokenAccounts } from '@p2p-wallet-web/core';
import type { Token } from '@saberhq/token-utils';
import { PublicKey } from '@solana/web3.js';
import classNames from 'classnames';
import { rgba } from 'polished';

import { isValidAddress, useSendState } from 'app/contexts';
import { RateUSD } from 'components/common/RateUSD';
import { FromToSelectInput } from 'components/pages/send/SendWidget/FromToSelectInput';
import { SendButtonBitcoin } from 'components/pages/send/SendWidget/SendButton';
import { SendButtonSolana } from 'components/pages/send/SendWidget/SendButton/SendButtonSolana';
import { TransferFee } from 'components/pages/send/SendWidget/TransferFee';
import { Switch, TextField } from 'components/ui';
import { trackEvent } from 'utils/analytics';

import { Hint } from '../../../common/Hint';
import { BurnAndRelease } from './BurnAndRelease';
import { BottomWrapper, ButtonWrapper, FromWrapper, WrapperWidgetPage } from './common/styled';
import { NetworkSelect } from './NetworkSelect';
import { ToAddressInput } from './ToAddressInput';

const Wrapper = styled.div`
  margin-top: 16px;
  padding: 8px 20px;
`;

const ToSendWrapper = styled(FromWrapper)``;

const FromTitle = styled.div`
  margin-bottom: 8px;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const ConfirmWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;
  padding: 20px 0 0;

  &.isShowConfirmAddressSwitch {
    border-top: 1px solid #f6f6f8;
  }
`;

const ConfirmTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ConfirmTextPrimary = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
`;
const ConfirmTextSecondary = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

const HintWrapper = styled.div`
  padding: 12px 0;

  color: #a3a5ba;
  font-size: 14px;
  line-height: 21px;
  text-align: center;

  border-top: 1px solid ${rgba('#000', 0.05)};
`;

const TextFieldStyled = styled(TextField)`
  margin-bottom: 8px;
`;

const isValidAmount = (amount: string): boolean => {
  const amountValue = Number.parseFloat(amount);

  return amount === '' || amountValue === 0;
};

// TODO: refactor To field to own component wit logic by hooks
export const SendWidget: FunctionComponent = () => {
  const history = useHistory();

  const { provider } = useSolana();
  const {
    fromTokenAccount,
    setFromTokenAccount,
    fromAmount,
    setFromAmount,
    toPublicKey,
    blockchain,
    renNetwork,
    isExecuting,
    isAddressInvalid,
    isRenBTC,
  } = useSendState();
  const tokenAccounts = useUserTokenAccounts();

  const [isShowConfirmAddressSwitch, setIsShowConfirmAddressSwitch] = useState(false);
  const [isConfirmCorrectAddress, setIsConfirmCorrectAddress] = useState(false);
  const [isInitBurnAndRelease, setIsInitBurnAndRelease] = useState(false);

  useEffect(() => {
    const checkDestinationAddress = async () => {
      const account = await provider.getAccountInfo(new PublicKey(toPublicKey));

      if (!account) {
        setIsShowConfirmAddressSwitch(true);
      }
    };

    if (blockchain === 'solana' && isValidAddress(blockchain, toPublicKey, renNetwork)) {
      void checkDestinationAddress();
    } else {
      setIsShowConfirmAddressSwitch(false);
    }
  }, [blockchain, renNetwork, toPublicKey, provider]);

  const handleFromTokenAccountChange = (
    _nextToken: Token,
    nextTokenAccount: TokenAccount | null,
  ) => {
    if (!nextTokenAccount?.key) {
      return;
    }

    trackEvent('send_select_token_click', {
      tokenTicker: nextTokenAccount.balance?.token.symbol || '',
    });

    setFromTokenAccount(nextTokenAccount);
    history.replace(`/send/${nextTokenAccount.key.toBase58()}`);
  };

  const handleFromAmountChange = (minorAmount: string, type?: string) => {
    setFromAmount(minorAmount);

    if (type === 'available') {
      trackEvent('send_available_click', { sum: Number(minorAmount) });
    } else {
      trackEvent('send_amount_keydown', { sum: Number(minorAmount) });
    }
  };

  const hasBalance = fromTokenAccount?.balance
    ? fromTokenAccount.balance?.asNumber >= Number(fromAmount)
    : false;

  const isDisabled = isExecuting;
  const isDisabledButton =
    isDisabled ||
    isValidAmount(fromAmount) ||
    isAddressInvalid ||
    !hasBalance ||
    (isShowConfirmAddressSwitch && !isConfirmCorrectAddress);

  return (
    <div>
      <WrapperWidgetPage title="Send" icon="top">
        <Wrapper>
          <FromWrapper>
            <FromToSelectInput
              tokenAccounts={tokenAccounts}
              tokenAccount={fromTokenAccount}
              onTokenAccountChange={handleFromTokenAccountChange}
              amount={fromAmount}
              onAmountChange={handleFromAmountChange}
              disabled={isDisabled}
            />
          </FromWrapper>
          <ToSendWrapper>
            <FromTitle>To</FromTitle>
            <ToAddressInput />
            {isShowConfirmAddressSwitch ? (
              <ConfirmWrapper className={classNames({ isShowConfirmAddressSwitch })}>
                <ConfirmTextWrapper>
                  <ConfirmTextPrimary>
                    Is this address correct? It doesn’t have funds.
                  </ConfirmTextPrimary>
                  <ConfirmTextSecondary>I’m sure, It’s correct</ConfirmTextSecondary>
                </ConfirmTextWrapper>
                <Switch
                  checked={isConfirmCorrectAddress}
                  onChange={() => setIsConfirmCorrectAddress(!isConfirmCorrectAddress)}
                />
              </ConfirmWrapper>
            ) : undefined}
          </ToSendWrapper>

          {isRenBTC ? <NetworkSelect /> : undefined}

          <TextFieldStyled
            label="Current price"
            value={
              <>
                <RateUSD symbol={fromTokenAccount?.balance?.token.symbol} />{' '}
                <span>&nbsp;per {fromTokenAccount?.balance?.token.symbol} </span>
              </>
            }
          />
          <TransferFee />

          <BottomWrapper>
            <ButtonWrapper>
              {blockchain === 'bitcoin' ? (
                <SendButtonBitcoin
                  primary={!isDisabled}
                  disabled={isDisabledButton}
                  onInitBurnAndRelease={() => setIsInitBurnAndRelease(true)}
                />
              ) : (
                <SendButtonSolana primary={!isDisabled} disabled={isDisabledButton} />
              )}
            </ButtonWrapper>
          </BottomWrapper>
          <HintWrapper>Send SOL or any SPL Tokens on one address</HintWrapper>
          {isInitBurnAndRelease ? (
            <BurnAndRelease destinationAddress={toPublicKey} targetAmount={fromAmount} />
          ) : undefined}
        </Wrapper>
      </WrapperWidgetPage>
      <Hint />
    </div>
  );
};
