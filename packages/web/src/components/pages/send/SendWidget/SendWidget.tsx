import type { FunctionComponent } from 'react';
import { useEffect } from 'react';

import { useSolana } from '@p2p-wallet-web/core';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
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
    fromTokenAccount,
    toPublicKey,
    blockchain,
    renNetwork,
    isInitBurnAndRelease,
    resolvedAddress,
    setIsShowConfirmAddressSwitch,
  } = useSendState();

  useEffect(() => {
    let pubKey: string | null = '';
    const isSolanaNetwork = blockchain === 'solana';
    const isSolanaToken = fromTokenAccount?.balance?.token?.isRawSOL;

    const checkDestinationAddress = async () => {
      if (isSolanaToken) {
        return;
      }

      if (pubKey) {
        const account = await provider.getAccountInfo(new PublicKey(pubKey));
        const programms = await provider.connection.getTokenAccountsByOwner(new PublicKey(pubKey), {
          programId: TOKEN_PROGRAM_ID,
          mint: fromTokenAccount?.balance?.token?.mintAccount,
        });
        const userHasToken = Boolean(programms.value.length);

        if (!account && !userHasToken) {
          setIsShowConfirmAddressSwitch(true);
        }
      }
    };

    if (isValidAddress(blockchain, toPublicKey, renNetwork)) {
      pubKey = toPublicKey;
    } else if (isValidAddress(blockchain, resolvedAddress ?? '', renNetwork)) {
      pubKey = resolvedAddress;
    }

    if (pubKey && isSolanaNetwork) {
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
    fromTokenAccount,
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
