import type { FC } from 'react';
import { NavLink } from 'react-router-dom';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { Content } from 'new/scenes/Main/Receive/common/styled';
import { ReceiveViewModel } from 'new/scenes/Main/Receive/Receive.ViewModel';
import { ReceiveBitcoin } from 'new/scenes/Main/Receive/ReceiveBitcoin';
import { NetworkSelect } from 'new/scenes/Main/Receive/ReceiveToken/NetworkSelect';
import { ReceiveSolana } from 'new/scenes/Main/Receive/Solana';
import { Layout } from 'new/ui/components/common/Layout';
import { WidgetPage } from 'new/ui/components/common/WidgetPage';

const WhatTokensCanIReceiveLink = styled(NavLink)`
  color: ${theme.colors.textIcon.active};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;
  text-align: center;
  text-decoration: none;
`;

export const ReceiveToken: FC = observer(() => {
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
          {isTokenListAvailable ? (
            <WhatTokensCanIReceiveLink to="/receive/tokens">
              What tokens can I receive?
            </WhatTokensCanIReceiveLink>
          ) : null}
        </Content>

        {renderSourceNetworkReceivePanel()}
      </WidgetPage>
    </Layout>
  );
});
