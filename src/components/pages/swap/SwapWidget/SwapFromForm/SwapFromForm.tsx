import React, { FC } from 'react';

import { useMarket, useRouteVerbose, useSwapContext } from '@project-serum/swap-ui';

import { SwapTokenForm } from '../SwapTokenForm';

interface Props {
  className?: string;
}

export const SwapFromForm: FC<Props> = ({ className }) => {
  const { fromMint, toMint, setFromMint, fromAmount, setFromAmount } = useSwapContext();
  const route = useRouteVerbose(fromMint, toMint);
  const fromMarket = useMarket(route && route.markets ? route.markets[0] : undefined);

  return (
    <SwapTokenForm
      from
      mint={fromMint}
      setMint={setFromMint}
      amount={fromAmount}
      setAmount={setFromAmount}
      // @ts-ignore
      market={fromMarket}
      className={className}
    />
  );
};
