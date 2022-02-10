import type { FC } from 'react';
import { NavLink } from 'react-router-dom';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { useReceiveState } from 'app/contexts';
import { WidgetPage } from 'components/common/WidgetPage';

import { Content } from './common/styled';
import { NetworkSelect } from './NetworkSelect';
import { ReceiveBitcoin } from './ReceiveBitcoin';
import { ReceiveSolana } from './ReceiveSolana/ReceiveSolana';

const WhatCanReceiveLink = styled(NavLink)`
  color: ${theme.colors.textIcon.active};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;
  text-align: center;
  text-decoration: none;
`;

export const ReceiveWidget: FC = () => {
  const { sourceNetwork } = useReceiveState();

  const renderSourceNetworkReceivePanel = () => {
    switch (sourceNetwork) {
      case 'bitcoin':
        return <ReceiveBitcoin />;
      case 'solana':
      default:
        return <ReceiveSolana />;
    }
  };

  return (
    <WidgetPage title="Receive" icon="bottom">
      <Content>
        <NetworkSelect />{' '}
        {sourceNetwork === 'solana' ? (
          <WhatCanReceiveLink to="/receive/tokens">What tokens can I receive?</WhatCanReceiveLink>
        ) : undefined}
      </Content>

      {renderSourceNetworkReceivePanel()}
    </WidgetPage>
  );
};
