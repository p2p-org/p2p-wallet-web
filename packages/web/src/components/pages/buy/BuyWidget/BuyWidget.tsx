import type { FC } from 'react';

import { styled } from '@linaria/react';

import { MOONPAY_API_KEY, MOONPAY_SIGNER_URL, useBuyState } from 'app/contexts';

import { MoonpayForm } from './MoonpayForm';
import { MoonpayIframe } from './MoonpayIframe';

const Error = styled.div`
  align-self: center;

  color: #f43d3d;
`;

export const BuyWidget: FC = () => {
  const { isShowIframe } = useBuyState();

  if (!MOONPAY_API_KEY || !MOONPAY_SIGNER_URL) {
    return <Error>MOONPAY_SIGNER_URL and MOONPAY_API_KEY must be set</Error>;
  }

  if (isShowIframe) {
    return <MoonpayIframe />;
  }

  return <MoonpayForm />;
};
