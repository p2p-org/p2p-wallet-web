import type { FC } from 'react';
import { useMemo } from 'react';

import { getRenNetworkDetails } from '@renproject/interfaces';

import { LoaderBlock } from 'components/common/LoaderBlock';
import { UsernameAddressWidget } from 'components/common/UsernameAddressWidget';
import { Hint } from 'components/pages/receive/ReceiveWidget/ReceiveBitcoin/LockAndMintBtc/Hint';
import { trackEvent } from 'utils/analytics';
import { useRenNetwork } from 'utils/hooks/renBridge/useNetwork';
import { useLockAndMintProvider } from 'utils/providers/LockAndMintProvider';

import { BottomWrapper, Content, ExplorerA } from '../../common/styled';
import { DepositStatus } from './DepositStatus';

export const LockAndMintBtc: FC = () => {
  const network = useRenNetwork();
  const targetConfirmationsCount = useMemo(
    () => (getRenNetworkDetails(network).isTestnet ? 1 : 6),
    [network],
  );

  const handleExplorerClick = () => {
    trackEvent('Receive_Viewing_Explorer', { Receive_Network: 'bitcoin' });
  };

  const lockAndMintProvider = useLockAndMintProvider();

  if (!lockAndMintProvider.isConfigInitialized) {
    lockAndMintProvider.initializeConfig();
  }

  if (!lockAndMintProvider.gatewayAddress) {
    return <LoaderBlock />;
  }

  return (
    <>
      <Content className="noTopPadding">
        <Hint expiryTime={lockAndMintProvider.expiryTime} />
        <UsernameAddressWidget address={lockAndMintProvider.gatewayAddress} />
        <div>
          {Object.keys(lockAndMintProvider.deposits).map((depositId) => (
            <DepositStatus
              key={depositId}
              {...lockAndMintProvider.deposits[depositId]}
              targetConfirmationsCount={targetConfirmationsCount}
            />
          ))}
        </div>
      </Content>
      <BottomWrapper>
        <ExplorerA
          href={`https://btc.com/btc/address/${lockAndMintProvider.gatewayAddress}`}
          target="_blank"
          rel="noopener noreferrer noindex"
          onClick={handleExplorerClick}
          className="button"
        >
          View in Bitcoin explorer
        </ExplorerA>
      </BottomWrapper>
    </>
  );
};
