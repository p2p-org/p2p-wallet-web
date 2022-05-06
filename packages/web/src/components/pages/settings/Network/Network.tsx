import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { useWallet } from '@p2p-wallet-web/core';
import { theme } from '@p2p-wallet-web/ui';
import { useFeatures } from 'flagged';
import { rgba } from 'polished';

import { WidgetPage } from 'components/common/WidgetPage';
import { RadioButton } from 'components/ui';
import type { NetworkObj } from 'config/constants';
import { NETWORKS } from 'config/constants';
import { trackEvent } from 'utils/analytics';

const RadioButtonsWrapper = styled.div`
  position: relative;

  padding: 0 10px;
`;

/* eslint-disable @typescript-eslint/no-magic-numbers */
const RadioButtonItem = styled.div`
  position: relative;

  margin-top: 6px;
  margin-bottom: 12px;
  padding: 14px 18px;

  border-radius: 12px;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.bg.secondary};
  }

  &::after {
    position: absolute;
    right: 10px;
    bottom: -6px;
    left: 10px;

    border-bottom: 1px solid ${rgba(0, 0, 0, 0.05)};

    content: '';
  }
`;
/* eslint-enable @typescript-eslint/no-magic-numbers */

export const Network: FunctionComponent = () => {
  const { endpoint, setEndpoints, setNetwork } = useWallet();
  const features = useFeatures();

  const handleChange = (value: NetworkObj) => {
    trackEvent('settings_network_click', { endpoint: value.endpoint });

    setNetwork(value.network);
    setEndpoints({
      endpoint: value.endpoint,
      endpointWs: value.wsEndpoint,
    });
  };

  const visibleNetworks = Object.values(NETWORKS).filter((description) => {
    if (description.feature) {
      return features[description.feature];
    }

    return true;
  });

  const renderClustersRadioButtons = () =>
    visibleNetworks.map((networkItem) => {
      return (
        <RadioButtonItem key={networkItem.name}>
          <RadioButton
            label={networkItem.endpointLabel || networkItem.endpoint}
            value={networkItem}
            checked={networkItem.endpoint === endpoint}
            onChange={handleChange}
          />
        </RadioButtonItem>
      );
    });

  return (
    <WidgetPage icon="branch" title="Network">
      <RadioButtonsWrapper>
        <>
          {renderClustersRadioButtons()}
          {/* {renderCustomClustersRadioButtons()} */}
        </>
      </RadioButtonsWrapper>
    </WidgetPage>
  );
};
