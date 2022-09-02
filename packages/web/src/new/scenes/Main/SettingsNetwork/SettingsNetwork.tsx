import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';
import { rgba } from 'polished';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { SettingsNetworkViewModel } from 'new/scenes/Main/SettingsNetwork/SettingsNetwork.ViewModel';
import { APIEndpoint } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { Layout } from 'new/ui/components/common/Layout';
import { WidgetPage } from 'new/ui/components/common/WidgetPage';
import { RadioButton } from 'new/ui/components/ui/RadioButton';

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

  &:not(:last-child)::after {
    position: absolute;
    right: 10px;
    bottom: -6px;
    left: 10px;

    border-bottom: 1px solid ${rgba(0, 0, 0, 0.05)};

    content: '';
  }
`;
/* eslint-enable @typescript-eslint/no-magic-numbers */

export const SettingsNetwork: FC = observer(() => {
  const viewModel = useViewModel(SettingsNetworkViewModel);

  return (
    <Layout
      breadcrumb={{
        currentName: 'Network',
        backTo: { pathname: '/settings', state: { fromPage: location.pathname } },
      }}
    >
      <WidgetPage icon="branch" title="Network">
        <RadioButtonsWrapper>
          {APIEndpoint.defaultEndpoints.map((endpoint) => {
            return (
              <RadioButtonItem key={endpoint.address}>
                <RadioButton
                  label={endpoint.address}
                  value={endpoint}
                  checked={endpoint.address === Defaults.apiEndpoint.address}
                  onChange={() => viewModel.setAPIEndpoint(endpoint)}
                />
              </RadioButtonItem>
            );
          })}
        </RadioButtonsWrapper>
      </WidgetPage>
    </Layout>
  );
});
