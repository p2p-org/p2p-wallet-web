import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { Layout } from 'components/common/Layout';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { BuyViewModel } from 'new/scenes/Main/Buy/Buy.ViewModel';
import { MoonpayIframeWidget, MoonpayWidget } from 'new/scenes/Main/Buy/Subviews';

const Error = styled.div`
  align-self: center;

  color: #f43d3d;
`;

export const Buy: FC = observer(() => {
  const viewModel = useViewModel(BuyViewModel);

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
