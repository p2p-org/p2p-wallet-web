import React, { FunctionComponent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';

import * as web3 from '@solana/web3.js';

import { SendSwapWidget } from 'components/common/SendSwapWidget';
import { transferTokens } from 'store/_actions/complex';
import { getPoolsAccounts } from 'store/_actions/complex/pools';
import { useTokenInfo } from 'utils/hooks/useTokenInfo';

type Props = {
  publicKey: string;
};

export const SwapWidget: FunctionComponent<Props> = ({ publicKey = '' }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [fromTokenAmount, setFromTokenAmount] = useState('');
  const [toTokenAmount, setToTokenAmount] = useState('');
  const [toTokenPublicKey, setToTokenPublicKey] = useState('');
  const { mint, decimals } = useTokenInfo(publicKey);

  useEffect(() => {
    dispatch(getPoolsAccounts());
  }, []);

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
      const components = [
        // {
        //   account: publicKey,
        //   mintAddress: mint,
        //   amount,
        // },
        // {
        //   mintAddress: B.mintAddress,
        //   amount: B.convertAmount(),
        // },
      ];

      const signature = await dispatch(
        transferTokens({
          sourcePublicKey: new web3.PublicKey(publicKey),
          destPublicKey: new web3.PublicKey(toTokenPublicKey),
          amount,
        }),
      );

      console.log(signature);
    } catch (error) {
      alert(error);
    }
  };

  const handleFromTokenChange = (nextTokenPublicKey: string) => {
    history.replace(`/swap/${nextTokenPublicKey}`);
  };

  const handleFromAmountChange = (nextTokenAmount: string) => {
    setFromTokenAmount(nextTokenAmount);
  };

  const handleToAmountChange = (nextTokenAmount: string) => {
    setToTokenAmount(nextTokenAmount);
  };

  return (
    <SendSwapWidget
      type="swap"
      title="Swap"
      actionText="Comming soon"
      fromTokenPublicKey={publicKey}
      fromTokenAmount={fromTokenAmount}
      toTokenPublicKey={toTokenPublicKey}
      toTokenAmount={toTokenAmount}
      onFromTokenChange={handleFromTokenChange}
      onFromAmountChange={handleFromAmountChange}
      onToTokenChange={handleToTokenChange}
      onToAmountChange={handleToAmountChange}
      onBackClick={handleBackClick}
      onSubmit={handleSubmit}
    />
  );
};
