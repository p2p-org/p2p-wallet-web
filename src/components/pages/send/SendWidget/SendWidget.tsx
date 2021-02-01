import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import { unwrapResult } from '@reduxjs/toolkit';
import * as web3 from '@solana/web3.js';
import Decimal from 'decimal.js';

import { TokenAccount } from 'api/token/TokenAccount';
import { SendSwapWidget } from 'components/common/SendSwapWidget';
import { ToastManager } from 'components/common/ToastManager';
import { RootState } from 'store/rootReducer';
import { getMinimumBalanceForRentExemption, transfer } from 'store/slices/wallet/WalletSlice';

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
            destination: new web3.PublicKey(toTokenPublicKey),
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

  const handleToPublicKeyChange = (nextPublicKey: TokenAccount | string) => {
    setToTokenPublicKey(nextPublicKey as string);
  };

  return (
    <SendSwapWidget
      type="send"
      title="Send"
      actionText={isExecuting ? 'Processing...' : 'Send'}
      fee={fee}
      fromTokenAccount={fromTokenAccount}
      onFromTokenAccountChange={handleFromTokenAccountChange}
      fromAmount={fromAmount}
      onFromAmountChange={handleFromAmountChange}
      toTokenAccount={toTokenPublicKey}
      onToTokenAccountChange={handleToPublicKeyChange}
      onSubmit={handleSubmit}
      disabled={isExecuting}
    />
  );
};
