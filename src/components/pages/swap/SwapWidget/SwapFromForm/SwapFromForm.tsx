import React, { FC } from 'react';

import { useSwap } from 'app/contexts/swap';
import { useMarket } from 'app/contexts/swap/dex';
import { useRouteVerbose } from 'app/contexts/swap/dex';

import { SwapTokenForm } from '../SwapTokenForm';

interface Props {
  className?: string;
}

export const SwapFromForm: FC<Props> = ({ className }) => {
  const { fromMint, toMint, setFromMint, fromAmount, setFromAmount } = useSwap();
  const route = useRouteVerbose(fromMint, toMint);
  const fromMarket = useMarket(route && route.markets ? route.markets[0] : undefined);

  return (
    <SwapTokenForm
      from
      mint={fromMint}
      setMint={setFromMint}
      amount={fromAmount}
      setAmount={setFromAmount}
      market={fromMarket}
      className={className}
    />
  );
};
