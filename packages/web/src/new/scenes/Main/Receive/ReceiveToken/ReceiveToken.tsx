import type { FC } from 'react';
import { NavLink } from 'react-router-dom';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Content } from 'new/scenes/Main/Receive/common/styled';
import type { ReceiveViewModel } from 'new/scenes/Main/Receive/Receive.ViewModel';
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

type Props = {
  viewModel: ReceiveViewModel;
};

export const ReceiveToken: FC<Props> = ({ viewModel }) => {
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
};
