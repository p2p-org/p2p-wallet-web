import type { FunctionComponent } from 'react';
import { useEffect } from 'react';

import { useSolana } from '@p2p-wallet-web/core';
import { PublicKey } from '@solana/web3.js';

import { isValidAddress, useSendState } from 'app/contexts';
import { useTrackEventOpen } from 'app/hooks/metrics';
import { WidgetPageWithBottom } from 'components/common/WidgetPageWithBottom';
import { Main } from 'components/pages/send/SendWidget/Main';
import { SendButton } from 'components/pages/send/SendWidget/SendButton';

import { BurnAndRelease } from './BurnAndRelease/BurnAndRelease';

export const SendWidget: FunctionComponent = () => {
  useTrackEventOpen('Send_Viewed');

  const { provider } = useSolana();
  const {
    fromAmount,
    toPublicKey,
    blockchain,
    renNetwork,
    isInitBurnAndRelease,
    setIsShowConfirmAddressSwitch,
  } = useSendState();

  useEffect(() => {
    const checkDestinationAddress = async () => {
      const account = await provider.getAccountInfo(new PublicKey(toPublicKey));

      if (!account) {
        setIsShowConfirmAddressSwitch(true);
      }
    };

    if (blockchain === 'solana' && isValidAddress(blockchain, toPublicKey, renNetwork)) {
      void checkDestinationAddress();
    } else {
      setIsShowConfirmAddressSwitch(false);
    }
  }, [blockchain, renNetwork, toPublicKey, provider, setIsShowConfirmAddressSwitch]);

  return (
    <WidgetPageWithBottom title="Send" icon="top" bottom={<SendButton />}>
      <Main />

      {isInitBurnAndRelease ? (
        <BurnAndRelease destinationAddress={toPublicKey} targetAmount={fromAmount} />
      ) : undefined}
    </WidgetPageWithBottom>
  );
};
