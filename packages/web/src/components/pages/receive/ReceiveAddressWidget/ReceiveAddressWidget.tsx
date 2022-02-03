import type { FC } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';

import { WidgetPage } from 'components/common/WidgetPage';
import { Select } from 'components/ui';
import { MenuItem } from 'components/ui/Select/MenuItem';

import { ReceiveSolana } from './ReceiveSolana';
import { LockAndMintBtc } from './renBridge/LockAndMintBtc';
import { RenGatewayWarning } from './renBridge/RenGatewayWarning';

const NetworkSelectWrapper = styled.div`
  padding: 12px 24px 0;
`;

const NetworkSelect = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;

  border: 1px solid #f6f6f8;
  border-radius: 12px;
`;

const NetworkSelectText = styled.div`
  display: flex;
  flex-grow: 1;

  font-weight: 600;
  font-size: 16px;
`;

const SOURCE_NETWORKS = ['solana', 'bitcoin'];

export const ReceiveAddressWidget: FC = () => {
  const [sourceNetwork, setSourceNetwork] = useState('solana');
  const [isShowGatewayAddress, setIsShowGatewayAddress] = useState(false);

  const handleSourceNetworkClick = (source: string) => {
    setSourceNetwork(source);
  };

  const renderSourceNetworkReceivePanel = () => {
    switch (sourceNetwork) {
      case 'bitcoin':
        if (isShowGatewayAddress) {
          return <LockAndMintBtc />;
        }
        return <RenGatewayWarning onShowButtonClick={() => setIsShowGatewayAddress(true)} />;
      case 'solana':
      default:
        return <ReceiveSolana />;
    }
  };

  return (
    <WidgetPage title="Receive" icon="bottom">
      <NetworkSelectWrapper>
        <NetworkSelect>
          <NetworkSelectText>Network</NetworkSelectText>
          <Select value={sourceNetwork}>
            {SOURCE_NETWORKS.map((network) => (
              <MenuItem
                key={network}
                isSelected={network === sourceNetwork}
                onItemClick={() => handleSourceNetworkClick(network)}
              >
                {network}
              </MenuItem>
            ))}
          </Select>
        </NetworkSelect>
      </NetworkSelectWrapper>
      {renderSourceNetworkReceivePanel()}
    </WidgetPage>
  );
};
