import React, { FunctionComponent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';

import * as web3 from '@solana/web3.js';

import { SendSwapWidget } from 'components/common/SendSwapWidget';
import { transferTokens } from 'store/actions/complex';

type Props = {
  publicKey: string;
};

export const SwapWidget: FunctionComponent<Props> = ({ publicKey = '' }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [fromTokenPublicKey, setFromTokenPublicKey] = useState(publicKey);
  const [fromTokenAmount, setFromTokenAmount] = useState('');
  const [toTokenPublicKey, setToTokenPublicKey] = useState('');

  const handleBackClick = () => {
    history.replace('/wallets');
  };

  const handleToPublicKeyChange = (nextPublicKey: string) => {
    setToTokenPublicKey(nextPublicKey);
  };

  const handleSubmit = async () => {
    const amount = Math.round(Number.parseFloat(fromTokenAmount) * 10 ** 9);

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    try {
      const signature = await dispatch(
        transferTokens({
          sourcePublicKey: new web3.PublicKey(fromTokenPublicKey),
          destPublicKey: new web3.PublicKey(toTokenPublicKey),
          amount,
        }),
      );

      history.push(`/send/${publicKey}/result`, { signature });
    } catch (error) {
      alert(error);
    }
  };

  const handleTokenChange = (nextTokenPublicKey: string) => {
    setFromTokenPublicKey(nextTokenPublicKey);
  };

  const handleAmountChange = (nextTokenAmount: string) => {
    setFromTokenAmount(nextTokenAmount);
  };

  return (
    <SendSwapWidget
      type="swap"
      title="Swap"
      actionText="Comming soon"
      fromTokenPublicKey={fromTokenPublicKey}
      fromTokenAmount={fromTokenAmount}
      toTokenPublicKey={toTokenPublicKey}
      onTokenChange={handleTokenChange}
      onAmountChange={handleAmountChange}
      onToPublicKeyChange={handleToPublicKeyChange}
      onBackClick={handleBackClick}
      onSubmit={handleSubmit}
      disabled
    />
  );
};
