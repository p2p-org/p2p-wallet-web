import type { FC } from 'react';
import { useMemo } from 'react';

import { styled } from '@linaria/react';
import { useWallet } from '@p2p-wallet-web/core';

import type { MoonpayIframeParams } from 'app/contexts';
import { buildParams, MOONPAY_API_KEY, MOONPAY_SIGNER_URL, useBuyState } from 'app/contexts';

import { WidgetPageBuy } from '../WidgetPageBuy';

const Wrapper = styled.div`
  height: 640px;
`;

const baseParams: MoonpayIframeParams = {
  apiKey: MOONPAY_API_KEY!,
  currencyCode: 'sol',
  baseCurrencyAmount: 100,
  baseCurrencyCode: 'usd',
  lockAmount: false,
};

export const MoonpayIframe: FC = () => {
  const { publicKey } = useWallet();
  const { buyQuote } = useBuyState();

  const urlWithParams = useMemo(
    () =>
      `${MOONPAY_SIGNER_URL}?${buildParams<MoonpayIframeParams>({
        ...baseParams,
        baseCurrencyAmount: buyQuote?.totalAmount || 0,
        walletAddress: publicKey?.toBase58(),
      })}`,
    [buyQuote?.totalAmount, publicKey],
  );

  return (
    <WidgetPageBuy>
      <Wrapper>
        <iframe
          allow="accelerometer; autoplay; camera; gyroscope; payment"
          frameBorder="0"
          width="100%"
          height="100%"
          src={urlWithParams}
          title="MoonPay Widget"
        >
          <p>Your browser does not support iframes.</p>
        </iframe>
      </Wrapper>
    </WidgetPageBuy>
  );
};
