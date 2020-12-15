import React, { FunctionComponent, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import { unwrapResult } from '@reduxjs/toolkit';
import * as web3 from '@solana/web3.js';
import Decimal from 'decimal.js';

import { TokenAccount } from 'api/token/TokenAccount';
import { SendSwapWidget } from 'components/common/SendSwapWidget';
import { transfer } from 'features/wallet/WalletSlice';
import { RootState } from 'store/rootReducer';

type Props = {
  publicKey: string;
};

export const SendWidget: FunctionComponent<Props> = ({ publicKey = '' }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [fromAmount, setFromAmount] = useState('');
  const [toTokenPublicKey, setToTokenPublicKey] = useState('');
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const fromTokenAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.toBase58() === publicKey),
    [tokenAccounts, publicKey],
  );

  const handleBackClick = () => {
    history.replace('/wallets');
  };

  const handleSubmit = async () => {
    if (!fromTokenAccount) {
      throw new Error(`Did't find token`);
    }

    const amount = new Decimal(fromAmount).mul(10 ** fromTokenAccount?.mint.decimals).toNumber();

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    try {
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
      console.error(error);
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
      title="Send tokens"
      actionText="Send"
      fromTokenAccount={fromTokenAccount}
      onFromTokenAccountChange={handleFromTokenAccountChange}
      fromAmount={fromAmount}
      onFromAmountChange={handleFromAmountChange}
      toTokenAccount={toTokenPublicKey}
      onToTokenAccountChange={handleToPublicKeyChange}
      onBackClick={handleBackClick}
      onSubmit={handleSubmit}
    />
  );
};
