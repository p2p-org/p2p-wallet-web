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
import { SHOW_MODAL_TRANSACTION_STATUS } from 'store/constants/modalTypes';
import { RootState } from 'store/rootReducer';
import { getMinimumBalanceForRentExemption, transfer } from 'store/slices/wallet/WalletSlice';

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

    try {
      setIsExecuting(true);

      const action = transfer({
        source: fromTokenAccount.address,
        destination: new PublicKey(toTokenPublicKey),
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
          <Button primary={!isDisabled} disabled={isDisabled} big full onClick={handleSubmit}>
            Send
          </Button>
          <Hint>All deposits are stored 100% non-custodiallity with keys held on this device</Hint>
        </ButtonWrapper>
      </BottomWrapper>
    </WrapperWidgetPage>
  );
};
