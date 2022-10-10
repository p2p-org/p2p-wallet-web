import type { FC } from 'react';
import { useLayoutEffect, useState } from 'react';

import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { Network } from 'new/scenes/Main/Send';
import type { NetworkSelectViewModelType } from 'new/scenes/Main/Send/NetworkSelect/NetworkSelect.ViewModel';
import { NetworkView } from 'new/scenes/Main/Send/NetworkSelect/NetworkView';
import type * as FeeRelayer from 'new/sdk/FeeRelayer';
import type { Token } from 'new/sdk/SolanaSDK';
import { Select, SelectItem } from 'new/ui/components/common/Select';

const CautionWrapper = styled.div`
  margin: 0 12px;
  padding: 18px;

  font-weight: 400;
  font-size: 12px;
  line-height: 160%;

  background-color: ${theme.colors.bg.special};

  border-radius: 12px;

  ${up.tablet} {
    margin: 0;

    font-size: 14px;
  }
`;

const NotificationWrapper = styled.div`
  margin: 0 12px;
  padding: 16px 20px;

  font-weight: 400;
  font-size: 12px;
  line-height: 160%;

  background-color: ${theme.colors.system.successBg};

  border: 1px solid ${theme.colors.system.successMain};
  border-radius: 12px;

  ${up.tablet} {
    margin: 0;

    font-size: 14px;
  }
`;

const cautionEl = () => {
  return (
    <CautionWrapper>
      P2P Wallet will automatically match your withdrawal target address to the correct network for
      most withdrawals.
      <br />
      <br />
      However, before sending your funds, make sure to double-check the selected network.
    </CautionWrapper>
  );
};

const notificationEl = (usageStatus: FeeRelayer.UsageStatus | null) => {
  if (!usageStatus) {
    return null;
  }

  let notification;

  if (usageStatus.currentUsage < usageStatus.maxUsage) {
    notification = `On the Solana network, the first ${usageStatus.maxUsage} transactions in a day are
        paid by P2P.org. Subsequent transactions will be charged based on the Solana blockchain gas
        fee.`;
  } else {
    notification = `Your ${usageStatus.maxUsage} free transactions have been used up. You will have to pay 
        the network fee for subsequent transactions or wait until tomorrow when the counter resets.`;
  }

  return <NotificationWrapper>{notification}</NotificationWrapper>;
};

type Props = {
  viewModel: Readonly<NetworkSelectViewModelType>;
};

export const NetworkSelect: FC<Props> = observer(({ viewModel }) => {
  const [usageStatus, setUsageStatus] = useState<FeeRelayer.UsageStatus | null>(null);

  useLayoutEffect(() => {
    void viewModel.getFreeTransactionFeeLimit().then(setUsageStatus);
  }, []);

  const getTokenByNetwork = (network: Network): Token | undefined => {
    let wallet;

    if (network === Network.solana) {
      wallet = viewModel.walletsRepository.nativeWallet;
    } else {
      wallet = viewModel.walletsRepository
        .getWallets()
        .find((wallet) => wallet.token.symbol === 'renBTC');
    }

    return wallet?.token;
  };

  const networks = [];
  if (viewModel.getSelectableNetworks.includes(Network.solana)) {
    networks.push(Network.solana);
  }
  if (viewModel.getSelectableNetworks.includes(Network.bitcoin)) {
    networks.push(Network.bitcoin);
  }

  return (
    <Select
      mobileListTitle="Choose the network"
      value={
        <NetworkView
          network={viewModel.network}
          token={getTokenByNetwork(viewModel.network)}
          payingWallet={viewModel.payingWallet}
          feeInfo={viewModel.feeInfo.value}
        />
      }
    >
      {cautionEl()}

      {viewModel.getSelectableNetworks
        .map((network) => [
          <SelectItem
            key={network}
            isSelected={viewModel.network === network}
            onItemClick={() => viewModel.selectNetwork(network)}
          >
            <NetworkView
              network={network}
              token={getTokenByNetwork(network)}
              payingWallet={viewModel.payingWallet}
              feeInfo={viewModel.feeInfo.value}
            />
          </SelectItem>,
          network === Network.solana ? notificationEl(usageStatus) : null,
        ])
        .flat()}
    </Select>
  );
});
