import type { FC } from 'react';
import { useEffect } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import type { BuyViewModelProps } from 'new/scenes/Main/Buy/Subviews/Moonpay/types';
import { WidgetPageBuy } from 'new/scenes/Main/Buy/Subviews/Moonpay/WidgetPageBuy';
import { trackEvent1 } from 'new/sdk/Analytics';
import {
  MOONPAY_API_IP_ADDRESS,
  MOONPAY_API_KEY,
  MOONPAY_SIGNER_URL,
} from 'new/services/BuyService/constants';
import { buildParams } from 'new/services/BuyService/MoonpayProvider/utils';
import type { MoonpayIframeParams, MoonpayIpAddressResponse } from 'new/services/BuyService/types';
import { cancellableAxios } from 'new/utils/promise/PromiseExtensions';

const Wrapper = styled.div`
  height: 640px;
`;

const baseParams = {
  apiKey: MOONPAY_API_KEY,
};

const moonpayIframeParams: MoonpayIframeParams = {
  ...baseParams,
  currencyCode: 'sol',
  baseCurrencyAmount: 100,
  baseCurrencyCode: 'usd',
  lockAmount: false,
};

export const MoonpayIframeWidget: FC<BuyViewModelProps> = observer(({ viewModel }) => {
  useEffect(() => {
    // track iFrame shown event
    trackEvent1({ name: 'Moonpay_Window' });

    // track unsupported region
    const cancellableIpAddressRequest = cancellableAxios<MoonpayIpAddressResponse>({
      url: MOONPAY_API_IP_ADDRESS,
      params: baseParams,
    }).then((response) => {
      if (!response.data.isBuyAllowed) {
        trackEvent1({ name: 'Buy_Unsupported_Region_Showed' });
      }
    });

    return () => {
      // track iFrame closed event
      trackEvent1({ name: 'Moonpay_Window_Closed' });

      // cancel IP address request
      cancellableIpAddressRequest.cancel('Moonpay window is closed');
    };
  }, []);

  const urlWithParams = expr(
    () =>
      `${MOONPAY_SIGNER_URL}?${buildParams<MoonpayIframeParams>({
        ...moonpayIframeParams,
        currencyCode: viewModel.crypto.moonpayCode,
        baseCurrencyAmount: viewModel.output.total,
        walletAddress: viewModel.pubkeyBase58,
      })}`,
  );

  return (
    <WidgetPageBuy>
      <Wrapper>
        <iframe
          id="moonpayIframe"
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
});
