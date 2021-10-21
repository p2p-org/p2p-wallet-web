import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { moonpayApiKey, moonpayWidgetUrl } from 'config/constants';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px 10px;
  height: 640px;
`;

const Error = styled.div`
  align-self: center;

  color: #f43d3d;
`;

const params = {
  apiKey: moonpayApiKey,
  currencyCode: 'eth',
  baseCurrencyAmount: 100,
  lockAmount: false,
};

const buildParams = (params: any) => {
  return Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};

export const MoonpayWidget: FC = () => {
  if (!moonpayApiKey && !moonpayWidgetUrl) {
    return (
      <Wrapper>
        <Error>moonpayWidgetUrl and moonpayApiKey must be set</Error>
      </Wrapper>
    );
  }

  const urlWithParams = `${moonpayWidgetUrl}?${buildParams(params)}`;

  return (
    <Wrapper>
      <iframe
        allow="accelerometer; autoplay; camera; gyroscope; payment"
        frameBorder="0"
        width="100%"
        height="100%"
        src={urlWithParams}
        title="MoonPay Widget">
        <p>Your browser does not support iframes.</p>
      </iframe>
    </Wrapper>
  );
};
