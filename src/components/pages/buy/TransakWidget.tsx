import React, { FC } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import TransakSDK from '@transak/transak-sdk';

import { Button } from 'components/ui';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;

  padding: 16px 24px;
`;

const handleTransakClick = (publicKey: string | null) => () => {
  const transak = new TransakSDK({
    apiKey: process.env.REACT_APP_TRANSAK_API_KEY, // Your API Key
    environment: 'STAGING', // STAGING/PRODUCTION
    defaultCryptoCurrency: 'SOL',
    cryptoCurrencyList: 'SOL,USDT',
    networks: 'solana,mainnet',
    walletAddress: publicKey, // Your customer's wallet address
    themeColor: '5887FF', // App theme color
    fiatCurrency: '', // INR/GBP
    email: '', // Your customer's email address
    redirectURL: '',
    hostURL: window.location.origin,
    widgetHeight: '680px',
    widgetWidth: '500px',
  });

  transak.init();

  // To get all the events
  transak.on(transak.ALL_EVENTS, (data: any) => {
    console.log(data);
  });

  // This will trigger when the user marks payment is made.
  transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData: any) => {
    console.log(orderData);
    transak.close();
  });
};

export const TransakWidget: FC = () => {
  const publicKey = useSelector((state) => state.wallet.publicKey);
  return (
    <Wrapper>
      {process.env.REACT_APP_TRANSAK_API_KEY ? (
        <Button primary onClick={handleTransakClick(publicKey)}>
          Transak
        </Button>
      ) : undefined}
    </Wrapper>
  );
};
