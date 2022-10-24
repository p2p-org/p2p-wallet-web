import type { FC } from 'react';
import { useEffect } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import type { BuyViewModelProps } from 'new/scenes/Main/Buy/Subviews/Moonpay/types';
import { WidgetPageBuy } from 'new/scenes/Main/Buy/Subviews/Moonpay/WidgetPageBuy';
import { trackEvent1 } from 'new/sdk/Analytics';
import { MOONPAY_API_KEY, MOONPAY_SIGNER_URL } from 'new/services/BuyService/constants';
import { buildParams } from 'new/services/BuyService/MoonpayProvider/utils';
import type { MoonpayIframeParams } from 'new/services/BuyService/types';

const Wrapper = styled.div`
  height: 640px;
`;

const baseParams: MoonpayIframeParams = {
  apiKey: MOONPAY_API_KEY,
  currencyCode: 'sol',
  baseCurrencyAmount: 100,
  baseCurrencyCode: 'usd',
  lockAmount: false,
};

export const MoonpayIframeWidget: FC<BuyViewModelProps> = observer(({ viewModel }) => {
  useEffect(() => {
    trackEvent1({ name: 'Moonpay_Window' });
    return () => {
      trackEvent1({ name: 'Moonpay_Window_Closed' });
    };
  }, []);

  const urlWithParams = expr(
    () =>
      `${MOONPAY_SIGNER_URL}?${buildParams<MoonpayIframeParams>({
        ...baseParams,
        currencyCode: viewModel.crypto.moonpayCode,
        baseCurrencyAmount: viewModel.output.total,
        walletAddress: viewModel.pubkeyBase58,
      })}`,
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
});
