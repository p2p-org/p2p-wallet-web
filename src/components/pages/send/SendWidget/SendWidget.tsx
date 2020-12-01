import React, { FunctionComponent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';

import * as web3 from '@solana/web3.js';

import { SendSwapWidget } from 'components/common/SendSwapWidget';
import { transferTokens } from 'store/_actions/complex';
import { useTokenInfo } from 'utils/hooks/useTokenInfo';

type Props = {
  publicKey: string;
};

export const SendWidget: FunctionComponent<Props> = ({ publicKey = '' }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [fromTokenAmount, setFromTokenAmount] = useState('');
  const [toTokenPublicKey, setToTokenPublicKey] = useState('');
  const { decimals } = useTokenInfo(publicKey);

  const handleBackClick = () => {
    history.replace('/wallets');
  };

  const handleToTokenChange = (nextPublicKey: string) => {
    setToTokenPublicKey(nextPublicKey);
  };

  const handleSubmit = async () => {
    const amount = Math.round(Number.parseFloat(fromTokenAmount) * 10 ** decimals);

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    try {
      const signature = await dispatch(
        transferTokens({
          sourcePublicKey: new web3.PublicKey(publicKey),
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
