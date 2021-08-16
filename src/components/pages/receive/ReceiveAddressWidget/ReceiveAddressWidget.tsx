import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';

import { Hint } from 'components/common/Hint';
import { WidgetPage } from 'components/common/WidgetPage';
import { Button } from 'components/ui';

import { ReceiveSolana } from './ReceiveSolana';
import { ReceiveBtc } from './renBridge/ReceiveBtc';
import { RenGatewayWarning } from './renBridge/RenGatewayWarning';

const WrapperWidgetPage = styled(WidgetPage)``;

const SourceNetworkButtonWrapper = styled.div`
  display: flex;

  align-items: center;
  justify-content: center;

  margin-top: 16px;
`;

const SourceNetworkButtonstyled = styled(Button)`
  margin-right: 12px;

  text-transform: capitalize;
`;

const SOURCE_NETWORKS = ['solana', 'bitcoin'];

export const ReceiveAddressWidget: FC = () => {
  const [sourceNetwork, setSourceNetwork] = useState('solana');
  const [isShowGatewayAddress, setIsShowGatewayAddress] = useState(false);

  const handleSourceNetworkClick = (source: string) => () => {
    setSourceNetwork(source);
  };

  const renderSourceNetworkReceivePanel = () => {
    switch (sourceNetwork) {
      case 'bitcoin':
        if (isShowGatewayAddress) {
          return <ReceiveBtc />;
        }
        return <RenGatewayWarning onShowButtonClick={() => setIsShowGatewayAddress(true)} />;
      case 'solana':
      default:
        return <ReceiveSolana />;
    }
  };

  return (
    <div>
      <WrapperWidgetPage title="Receive" icon="bottom">
        <SourceNetworkButtonWrapper>
          {SOURCE_NETWORKS.map((source) => (
            <SourceNetworkButtonstyled
              key={source}
              small
              primary={sourceNetwork === source}
              lightGray={sourceNetwork !== source}
              onClick={handleSourceNetworkClick(source)}>
              {source}
            </SourceNetworkButtonstyled>
          ))}
        </SourceNetworkButtonWrapper>
        {renderSourceNetworkReceivePanel()}
      </WrapperWidgetPage>
      <Hint />
    </div>
  );
};
