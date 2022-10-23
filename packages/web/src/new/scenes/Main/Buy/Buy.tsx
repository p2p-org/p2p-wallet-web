import type { FC } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { BuyViewModel } from 'new/scenes/Main/Buy/Buy.ViewModel';
import { MoonpayIframeWidget, MoonpayWidget } from 'new/scenes/Main/Buy/Subviews';
import { Layout } from 'new/ui/components/common/Layout';
import { trackEvent1 } from 'new/utils/analytics';

const Error = styled.div`
  align-self: center;

  color: #f43d3d;
`;

export const Buy: FC = observer(() => {
  const viewModel = useViewModel(BuyViewModel);
  const location = useLocation<{ fromPage?: string }>();

  useEffect(() => {
    if (!location.state.fromPage) {
      return;
    }

    if (location.pathname !== location.state.fromPage) {
      trackEvent1({ name: 'Buy_Screen_Opened', params: { Last_Screen: location.state.fromPage } });
    }
  }, []);

  const renderContent = () => {
    if (!viewModel.areMoonpayConstantsSet) {
      return <Error>MOONPAY_SIGNER_URL and MOONPAY_API_KEY must be set</Error>;
    }

    if (viewModel.isShowIframe) {
      return <MoonpayIframeWidget viewModel={viewModel} />;
    }

    return <MoonpayWidget viewModel={viewModel} />;
  };

  return <Layout>{renderContent()}</Layout>;
});
