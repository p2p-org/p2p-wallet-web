import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import { AccountLayout } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { rgba } from 'polished';

import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { RateUSD } from 'components/common/RateUSD';
import { ToastManager } from 'components/common/ToastManager';
import { Button, Icon, Switch, Tooltip } from 'components/ui';
import { openModal } from 'store/actions/modals';
import {
  SHOW_MODAL_ERROR,
  SHOW_MODAL_TRANSACTION_CONFIRM,
  SHOW_MODAL_TRANSACTION_STATUS,
} from 'store/constants/modalTypes';
import { RootState } from 'store/rootReducer';
import {
  getMinimumBalanceForRentExemption,
  getRecentBlockhash,
  getTokenAccount,
  transfer,
} from 'store/slices/wallet/WalletSlice';
import { minorAmountToMajor } from 'utils/amount';
import { trackEvent } from 'utils/analytics';
import { useTrackEventOnce } from 'utils/hooks/useTrackEventOnce';

import { Hint } from '../../Hint';
import {
  BottomWrapper,
  ButtonWrapper,
  FeeLeft,
  FeeLine,
  FeeRight,
  FromToSelectInputStyled,
  FromWrapper,
  TooltipRow,
  TxName,
  TxValue,
  WrapperWidgetPage,
} from '../common/styled';
import { ToAddressInput } from './ToAddressInput';

const ToSendWrapper = styled(FromWrapper)``;

const FromTitle = styled.div`
  margin-bottom: 20px;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const InfoIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  margin-left: 10px;

  color: #a3a5ba;
`;

const FeeRightStyled = styled(FeeRight)`
  &:hover {
    color: #5887ff;

    ${InfoIcon} {
      color: #5887ff;
    }
  }
`;

const ConfirmWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;
  padding: 10px 20px;

  background: #f6f6f8;
  border-radius: 12px;
`;

const ConfirmTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 20px;
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

const Error = styled.div`
  margin-left: 66px;

  font-weight: 600;
  font-size: 16px;

  color: #f43d3d;
`;

type Props = {
  publicKey: string | null;
};

const isValidAmount = (amount: string): boolean => {
  const amountValue = Number.parseFloat(amount);

  return amount === '' || amountValue === 0;
};

const isValidAddress = (address: string): boolean => {
  try {
    // eslint-disable-next-line no-new
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

const formatFee = (amount: number): number =>
  new Decimal(amount)
    .div(10 ** 9)
    .toDecimalPlaces(9)
    .toNumber();

export const SendWidget: FunctionComponent<Props> = ({ publicKey = '' }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const trackEventOnce = useTrackEventOnce();
  const [fromAmount, setFromAmount] = useState('');
  const [toTokenPublicKey, setToTokenPublicKey] = useState('');
  const [txFee, setTxFee] = useState(0);
  const [rentFee, setRentFee] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isShowConfirmAddressSwitch, setIsShowConfirmAddressSwitch] = useState(false);
  const [isConfirmCorrectAddress, setIsConfirmCorrectAddress] = useState(false);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const fromTokenAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.toBase58() === publicKey),
    [tokenAccounts, publicKey],
  );

  const useFreeTransactions = useSelector(
    (state: RootState) => state.wallet.settings.useFreeTransactions,
  );

  useEffect(() => {
    const mount = async () => {
      try {
        const resultRentFee = unwrapResult(
          await dispatch(getMinimumBalanceForRentExemption(AccountLayout.span)),
        );

        const resultRecentBlockhash = unwrapResult(await dispatch(getRecentBlockhash()));

        setRentFee(formatFee(resultRentFee));
        setTxFee(formatFee(resultRecentBlockhash.feeCalculator.lamportsPerSignature));
      } catch (error) {
        console.log(error);
      }
    };

    if (!useFreeTransactions) {
      void mount();
    }
  }, []);

  useEffect(() => {
    const checkDestinationAddress = async () => {
      const account = unwrapResult(
        await dispatch(getTokenAccount(new PublicKey(toTokenPublicKey))),
      );

      if (!account) {
        setIsShowConfirmAddressSwitch(true);
      }
    };

    if (isValidAddress(toTokenPublicKey)) {
      void checkDestinationAddress();
    } else {
      setIsShowConfirmAddressSwitch(false);
    }
  }, [toTokenPublicKey]);

  const handleSubmit = async () => {
    if (!fromTokenAccount) {
      throw new Error(`Didn't find token`);
    }

    const amount = new Decimal(fromAmount).mul(10 ** fromTokenAccount?.mint.decimals).toNumber();

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    const destination = new PublicKey(toTokenPublicKey);

    if (fromTokenAccount?.mint.symbol !== 'SOL') {
      const account = unwrapResult(await dispatch(getTokenAccount(destination)));

      if (
        account &&
        account.mint.symbol !== 'SOL' &&
        !account.mint.address.equals(fromTokenAccount.mint.address)
      ) {
        void dispatch(
          openModal({
            modalType: SHOW_MODAL_ERROR,
            props: {
              icon: 'wallet',
              header: 'Wallet address is not valid',
              text: `The wallet address is not valid. It must be a ${fromTokenAccount.mint.symbol} wallet address`,
            },
          }),
        );
        return;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = unwrapResult(
      await dispatch(
        openModal({
          modalType: SHOW_MODAL_TRANSACTION_CONFIRM,
          props: {
            type: 'send',
            params: {
              source: fromTokenAccount,
              destination,
              amount: fromAmount,
            },
          },
        }),
      ),
    );

    if (!result) {
      return false;
    }

    try {
      setIsExecuting(true);

      const action = transfer({
        source: fromTokenAccount.address,
        destination,
        amount,
      });

      trackEvent('send_send_click', {
        tokenTicker: fromTokenAccount.mint.symbol || '',
        sum: amount,
      });

      unwrapResult(
        await dispatch(
          openModal({
            modalType: SHOW_MODAL_TRANSACTION_STATUS,
            props: {
              type: 'send',
              action,
              fromToken: fromTokenAccount.mint,
              fromAmount: new Decimal(amount),
            },
          }),
        ),
      );
    } catch (error) {
      ToastManager.error((error as Error).message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleFromTokenAccountChange = (
    nextToken: Token,
    nextTokenAccount: TokenAccount | null,
  ) => {
    if (!nextTokenAccount) {
      return;
    }

    trackEvent('send_select_token_click', { tokenTicker: nextTokenAccount.mint.symbol || '' });

    history.replace(`/send/${nextTokenAccount.address.toBase58()}`);
  };

  const handleFromAmountChange = (minorAmount: string, type?: string) => {
    setFromAmount(minorAmount);

    if (type === 'available') {
      trackEvent('send_available_click', { sum: Number(minorAmount) });
    } else {
      trackEvent('send_amount_keydown', { sum: Number(minorAmount) });
    }
  };

  const handleToPublicKeyChange = (nextPublicKey: string) => {
    setToTokenPublicKey(nextPublicKey);

    trackEventOnce('send_address_keydown');
  };

  const hasBalance = fromTokenAccount
    ? minorAmountToMajor(fromTokenAccount.balance, fromTokenAccount.mint).toNumber() >=
      Number(fromAmount)
    : false;

  const isDisabled = isExecuting;
  const isValidDestinationAddress = isValidAddress(toTokenPublicKey);

  // TODO
  const isNeedCreateWallet = false;

  const toolTipItems = [];
  if (useFreeTransactions) {
    toolTipItems.push(
      <TooltipRow key="tooltip-row-1">Paid by p2p.org.</TooltipRow>,
      <TooltipRow key="tooltip-row-2">We take care of all transfers costs ✌.</TooltipRow>,
    );
  } else {
    toolTipItems.push(
      <TooltipRow key="tooltip-row-3">
        <TxName>Transaction:</TxName>
        <TxValue>{`${txFee} SOL`}</TxValue>
      </TooltipRow>,
    );

    if (isNeedCreateWallet) {
      toolTipItems.push(
        <TooltipRow key="tooltip-row-4">
          <TxName>Wallet creation:</TxName>
          <TxValue>{`${rentFee} SOL`}</TxValue>
        </TooltipRow>,
      );
    }
  }

  return (
    <div>
      <WrapperWidgetPage title="Send" icon="top">
        <FromWrapper>
          <FromToSelectInputStyled
            tokenAccounts={tokenAccounts}
            token={fromTokenAccount?.mint}
            tokenAccount={fromTokenAccount}
            amount={fromAmount}
            onTokenAccountChange={handleFromTokenAccountChange}
            onAmountChange={handleFromAmountChange}
            disabled={isDisabled}
          />
          <FeeLine>
            {fromTokenAccount?.mint ? (
              <FeeLeft>
                1 {fromTokenAccount?.mint.symbol} =&nbsp;
                <RateUSD symbol={fromTokenAccount?.mint.symbol} />
              </FeeLeft>
            ) : undefined}
            <FeeRightStyled>
              <Tooltip
                title={
                  <>
                    <div>Fee: {isNeedCreateWallet ? txFee + rentFee : txFee} SOL</div>
                    <InfoIcon name="info" />
                  </>
                }>
                {toolTipItems}
              </Tooltip>
            </FeeRightStyled>
          </FeeLine>
        </FromWrapper>
        <ToSendWrapper>
          <FromTitle>Send to SOL or any SPL token address</FromTitle>
          <ToAddressInput value={toTokenPublicKey || ''} onChange={handleToPublicKeyChange} />
          {toTokenPublicKey.length > 0 && !isValidDestinationAddress ? (
            <Error>Check recepient address</Error>
          ) : undefined}
          {isShowConfirmAddressSwitch ? (
            <ConfirmWrapper>
              <Switch
                checked={isConfirmCorrectAddress}
                onChange={() => setIsConfirmCorrectAddress(!isConfirmCorrectAddress)}
              />
              <ConfirmTextWrapper>
                <ConfirmTextPrimary>
                  This address has no funds, are you sure its correct?
                </ConfirmTextPrimary>
                <ConfirmTextSecondary>I’m sure, It’s correct</ConfirmTextSecondary>
              </ConfirmTextWrapper>
            </ConfirmWrapper>
          ) : undefined}
        </ToSendWrapper>
        <BottomWrapper>
          <ButtonWrapper>
            <Button
              primary={!isDisabled}
              disabled={
                isDisabled ||
                isValidAmount(fromAmount) ||
                !isValidDestinationAddress ||
                !hasBalance ||
                (isShowConfirmAddressSwitch && !isConfirmCorrectAddress)
              }
              big
              full
              onClick={handleSubmit}>
              Send
            </Button>
          </ButtonWrapper>
        </BottomWrapper>
        <HintWrapper>Send SOL or any SPL Tokens on one address</HintWrapper>
      </WrapperWidgetPage>
      <Hint />
    </div>
  );
};
