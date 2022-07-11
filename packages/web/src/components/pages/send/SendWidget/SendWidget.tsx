import type { FunctionComponent } from 'react';

import { useSendState } from 'app/contexts';
import { useTrackEventOpen } from 'app/hooks/metrics';
import { WidgetPageWithBottom } from 'components/common/WidgetPageWithBottom';
import { Main } from 'components/pages/send/SendWidget/Main';
import { SendButton } from 'components/pages/send/SendWidget/SendButton';

import { BurnAndRelease } from './BurnAndRelease/BurnAndRelease';

export const SendWidget: FunctionComponent = () => {
  useTrackEventOpen('Send_Viewed');

  const { fromAmount, toPublicKey, isInitBurnAndRelease } = useSendState();

  return (
    <WidgetPageWithBottom title="Send" icon="top" bottom={<SendButton />}>
      <Main />

      {isInitBurnAndRelease ? (
        <BurnAndRelease destinationAddress={toPublicKey} targetAmount={fromAmount} />
      ) : undefined}
    </WidgetPageWithBottom>
  );
};
