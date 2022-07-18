import type { FunctionComponent } from 'react';
import { useEffect } from 'react';

import { useSolana } from '@p2p-wallet-web/core';

import { checkUserHasTokenAccount, isValidSolanaAddress, useSendState } from 'app/contexts';
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
    fromTokenAccount,
    toPublicKey,
    blockchain,
    renNetwork,
    isInitBurnAndRelease,
    resolvedAddress,
    setIsShowConfirmAddressSwitch,
    destinationAccount,
  } = useSendState();

  useEffect(() => {
    let pubKey: string | null = '';
    const isSolanaNetwork = blockchain === 'solana';

    if (isValidSolanaAddress(toPublicKey)) {
      const { address, owner } = destinationAccount || {};
      if (address?.toString() === toPublicKey && !!owner) {
        pubKey = owner.toString();
      } else {
        pubKey = toPublicKey;
      }
    } else if (isValidSolanaAddress(resolvedAddress ?? '')) {
      pubKey = resolvedAddress;
    }

    if (pubKey && isSolanaNetwork) {
      checkUserHasTokenAccount(pubKey, fromTokenAccount, provider)
        .then((userHasToken) => setIsShowConfirmAddressSwitch(!userHasToken))
        .catch(console.error);
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
    fromTokenAccount?.balance?.token?.mintAccount,
    destinationAccount,
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
