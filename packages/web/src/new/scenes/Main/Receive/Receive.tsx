import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { ReceiveBitcoin } from 'components/pages/receive/ReceiveWidget/ReceiveBitcoin';
import { ReceiveSolana } from 'components/pages/receive/ReceiveWidget/ReceiveSolana';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { Content } from 'new/scenes/Main/Receive/common/styled';
import { NetworkSelect } from 'new/scenes/Main/Receive/NetworkSelect';
import { ReceiveViewModel } from 'new/scenes/Main/Receive/Receive.ViewModel';
import { Layout } from 'new/ui/components/common/Layout';
import { WidgetPage } from 'new/ui/components/common/WidgetPage';

export const Receive: FC = observer(() => {
  const viewModel = useViewModel(ReceiveViewModel);
  const isTokenListAvailable = viewModel.tokenType.isSolana();

  const renderSourceNetworkReceivePanel = () => {
    if (viewModel.tokenType.isSolana()) {
      return <ReceiveSolana />;
    } else {
      return <ReceiveBitcoin />;
    }
  };

  return (
    <Layout>
      <WidgetPage title="Receive" icon="bottom">
        <Content>
          <NetworkSelect viewModel={viewModel} />{' '}
          {/*isTokenListAvailable ? (
          <WhatCanReceiveLink to="/receive/tokens">What tokens can I receive?</WhatCanReceiveLink>
        ) : undefined*/}
        </Content>

        {renderSourceNetworkReceivePanel()}
      </WidgetPage>
    </Layout>
  );
});
