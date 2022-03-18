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
    resolvedAddress,
    setIsShowConfirmAddressSwitch,
  } = useSendState();

  useEffect(() => {
    let pubKey: string | null = '';

    const checkDestinationAddress = async () => {
      if (pubKey) {
        const account = await provider.getAccountInfo(new PublicKey(pubKey));
        console.log(account, pubKey);

        if (!account) {
          setIsShowConfirmAddressSwitch(true);
        }
      }
    };

    if (isValidAddress(blockchain, toPublicKey, renNetwork)) {
      pubKey = toPublicKey;
    } else if (isValidAddress(blockchain, resolvedAddress ?? '', renNetwork)) {
      pubKey = resolvedAddress;
    }

    const isSolanaNetwork = blockchain === 'solana';

    if (isSolanaNetwork && pubKey) {
      void checkDestinationAddress();
    } else {
      setIsShowConfirmAddressSwitch(false);
    }
  }, [
    resolvedAddress,
    blockchain,
    renNetwork,
    toPublicKey,
    provider,
    setIsShowConfirmAddressSwitch,
  ]);

  return (
    <WidgetPageWithBottom title="Send" icon="top" bottom={<SendButton />}>
      <Main />

      {isInitBurnAndRelease ? (
        <BurnAndRelease destinationAddress={toPublicKey} targetAmount={fromAmount} />
      ) : undefined}
    </WidgetPageWithBottom>
  );
};
