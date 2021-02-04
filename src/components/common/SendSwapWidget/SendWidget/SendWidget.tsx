import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';

import { TokenAccount } from 'api/token/TokenAccount';
import { RateUSDT } from 'components/common/RateUSDT';
import { ToastManager } from 'components/common/ToastManager';
import { Button } from 'components/ui';
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
  IconStyled,
  IconWrapper,
  Title,
  TitleWrapper,
  WrapperWidget,
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
  publicKey: string;
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
        ToastManager.error(error);
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
      const signature = unwrapResult(
        await dispatch(
          transfer({
            source: fromTokenAccount.address,
            destination: new PublicKey(toTokenPublicKey),
            amount,
          }),
        ),
      );

      history.push(`/send/${publicKey}/result`, { signature });
    } catch (error) {
      ToastManager.error(error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleFromTokenAccountChange = (nextTokenAccount: TokenAccount) => {
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
    <WrapperWidget
      title={
        <TitleWrapper>
          <IconWrapper>
            <IconStyled name="top" />
          </IconWrapper>
          <Title>Send</Title>
        </TitleWrapper>
      }>
      <FromWrapper>
        <FromToSelectInputStyled
          tokenAccounts={tokenAccounts}
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
              <RateUSDT symbol={fromTokenAccount?.mint.symbol} />
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
            {isExecuting ? 'Processing...' : 'Send'}
          </Button>
          <Hint>All deposits are stored 100% non-custodiallity with keys held on this device</Hint>
        </ButtonWrapper>
      </BottomWrapper>
    </WrapperWidget>
  );
};
