import React, { FC } from 'react';

import { useSwap } from 'app/contexts/swap';
import { Accordion } from 'components/ui';

import { FeesOriginal } from './FeesOriginal';

export const Fees: FC = () => {
  const { trade } = useSwap();

  if (!trade.derivedFields) {
    return null;
  }

  const isSol = trade.inputTokenName === 'SOL';

  return (
    <Accordion title="Swap fees" noContentPadding>
      {isSol ? <FeesOriginal /> : <FeesOriginal />}
    </Accordion>
  );
};
