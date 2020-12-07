import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import * as web3 from '@solana/web3.js';
import { Decimal } from 'decimal.js';

import { TokenAccount } from 'api/token/TokenAccount';
import { SendSwapWidget } from 'components/common/SendSwapWidget';
import { transferTokens } from 'store/_actions/complex';
import { getPoolsAccounts } from 'store/_actions/complex/pools';
import { RootState } from 'store/rootReducer';

type Props = {
  publicKey: string;
};

export const SwapWidget: FunctionComponent<Props> = ({ publicKey = '' }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [fromTokenAmount, setFromTokenAmount] = useState<Decimal>(new Decimal(0));
  const [toTokenAmount, setToTokenAmount] = useState<Decimal>(new Decimal(0));
  const [toTokenPublicKey, setToTokenPublicKey] = useState('');
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const tokenAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.toBase58() === publicKey),
    [tokenAccounts, publicKey],
  );

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
    const amount = fromTokenAmount.div(10 ** (tokenAccount?.mint.decimals || 0)).toNumber();

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

  const handleFromAmountChange = (nextTokenAmount: Decimal) => {
    setFromTokenAmount(nextTokenAmount);
  };

  const handleToAmountChange = (nextTokenAmount: Decimal) => {
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
