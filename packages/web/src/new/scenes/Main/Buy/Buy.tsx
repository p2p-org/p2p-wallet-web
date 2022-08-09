import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { BuyViewModel } from 'new/scenes/Main/Buy/Buy.ViewModel';
import { Moonpay } from 'new/scenes/Main/Buy/Subviews';

const Error = styled.div`
  align-self: center;

  color: #f43d3d;
`;

export const Buy: FC = observer(() => {
  const viewModel = useViewModel(BuyViewModel);

  if (!viewModel.hasMoonpayAPIKey) {
    return <Error>MOONPAY_API_KEY must be set</Error>;
  }

  if (viewModel.isShowIframe) {
    return <span>Iframe is shown</span>;
    //return <MoonpayIframe viewModel={viewModel} />;
  }

  return <Moonpay viewModel={viewModel} />;
});
