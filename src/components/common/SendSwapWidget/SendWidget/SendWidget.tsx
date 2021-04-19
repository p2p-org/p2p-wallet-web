import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';

import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { RateUSD } from 'components/common/RateUSD';
import { ToastManager } from 'components/common/ToastManager';
import { Button } from 'components/ui';
import { openModal } from 'store/actions/modals';
import { SHOW_MODAL_ERROR, SHOW_MODAL_TRANSACTION_STATUS } from 'store/constants/modalTypes';
import { RootState } from 'store/rootReducer';
import {
  getMinimumBalanceForRentExemption,
  getTokenAccount,
  transfer,
} from 'store/slices/wallet/WalletSlice';
import { minorAmountToMajor } from 'utils/amount';

import {
  BottomWrapper,
  ButtonWrapper,
  FeeLeft,
  FeeLine,
  FeeRight,
  FromToSelectInputStyled,
  FromWrapper,
  Hint,
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

export const SendWidget: FunctionComponent<Props> = ({ publicKey = '' }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [fromAmount, setFromAmount] = useState('');
  const [toTokenPublicKey, setToTokenPublicKey] = useState('');
  const [fee, setFee] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const fromTokenAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.toBase58() === publicKey),
    [tokenAccounts, publicKey],
  );

  useEffect(() => {
    const mount = async () => {
      try {
        // TODO: not 0
        const resultFee = unwrapResult(await dispatch(getMinimumBalanceForRentExemption(0)));
        setFee(
          new Decimal(resultFee)
            .div(10 ** 9)
            .toDecimalPlaces(9)
            .toNumber(),
        );
      } catch (error) {
        ToastManager.error((error as Error).message);
      }
    };

    void mount();
  }, []);

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

      if (!account) {
        void dispatch(
          openModal({
            modalType: SHOW_MODAL_ERROR,
            props: {
              icon: 'branch',
              header: 'Current SOL Address are not in blockchain network',
              text:
                'If you are sending tokens to a new SOL wallet make sure that recepient’s balance is’n empty.',
            },
          }),
        );
        return;
      }

      if (
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

    try {
      setIsExecuting(true);

      const action = transfer({
        source: fromTokenAccount.address,
        destination,
        amount,
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

    history.replace(`/send/${nextTokenAccount.address.toBase58()}`);
  };

  const handleFromAmountChange = (minorAmount: string) => {
    setFromAmount(minorAmount);
  };

  const handleToPublicKeyChange = (nextPublicKey: string) => {
    setToTokenPublicKey(nextPublicKey);
  };

  const hasBalance = fromTokenAccount
    ? minorAmountToMajor(fromTokenAccount.balance, fromTokenAccount.mint).toNumber() >=
      Number(fromAmount)
    : false;

  const isDisabled = isExecuting;

  return (
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
          {fee ? <FeeRight>Fee: {fee} SOL</FeeRight> : undefined}
        </FeeLine>
      </FromWrapper>
      <ToSendWrapper>
        <FromTitle>Send to</FromTitle>
        <ToAddressInput value={toTokenPublicKey || ''} onChange={handleToPublicKeyChange} />
      </ToSendWrapper>
      <BottomWrapper>
        <ButtonWrapper>
          <Button
            primary={!isDisabled}
            disabled={
              isDisabled ||
              isValidAmount(fromAmount) ||
              !isValidAddress(toTokenPublicKey) ||
              !hasBalance
            }
            big
            full
            onClick={handleSubmit}>
            Send
          </Button>
          <Hint>All deposits are stored 100% non-custodiallity with keys held on this device</Hint>
        </ButtonWrapper>
      </BottomWrapper>
    </WrapperWidgetPage>
  );
};
