import React, { FunctionComponent, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import * as web3 from '@solana/web3.js';
import Decimal from 'decimal.js';

import { TokenAccount } from 'api/token/TokenAccount';
import { SendSwapWidget } from 'components/common/SendSwapWidget';
import { transfer } from 'features/wallet/WalletSlice';
import { transferTokens } from 'store/_actions/complex';
import { RootState } from 'store/rootReducer';

type Props = {
  publicKey: string;
};

export const SendWidget: FunctionComponent<Props> = ({ publicKey = '' }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [fromTokenAmount, setFromTokenAmount] = useState('');
  const [toTokenPublicKey, setToTokenPublicKey] = useState('');
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const tokenAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.toBase58() === publicKey),
    [tokenAccounts, publicKey],
  );

  const handleBackClick = () => {
    history.replace('/wallets');
  };

  const handleToTokenChange = (nextPublicKey: string) => {
    setToTokenPublicKey(nextPublicKey);
  };

  const handleSubmit = async () => {
    const amount = new Decimal(fromTokenAmount)
      .mul(10 ** (tokenAccount?.mint.decimals || 0))
      .toNumber();

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    try {
      const signature = await dispatch(
        transfer({
          source: new web3.PublicKey(publicKey),
          destination: new web3.PublicKey(toTokenPublicKey),
          amount,
        }),
      );

      history.push(`/send/${publicKey}/result`, { signature });
    } catch (error) {
      alert(error);
    }
  };

  const handleTokenChange = (nextTokenPublicKey: string) => {
    history.replace(`/send/${nextTokenPublicKey}`);
  };

  const handleAmountChange = (nextTokenAmount: string) => {
    setFromTokenAmount(nextTokenAmount);
  };

  return (
    <SendSwapWidget
      type="send"
      title="Send tokens"
      actionText="Send"
      fromTokenPublicKey={publicKey}
      fromTokenAmount={fromTokenAmount}
      toTokenPublicKey={toTokenPublicKey}
      onFromTokenChange={handleTokenChange}
      onFromAmountChange={handleAmountChange}
      onToTokenChange={handleToTokenChange}
      onBackClick={handleBackClick}
      onSubmit={handleSubmit}
    />
  );
};
