import React, { FC, useState } from 'react';

import { useSwap } from 'app/contexts/swap';
import { useMarket } from 'app/contexts/swap/dex';
import { useCanSwap } from 'app/contexts/swap/swap';
import { useTokenMap } from 'app/contexts/swap/tokenList';
import { useSendSwap } from 'components/pages/swap/SwapWidget/SwapButton/hooks/useSendSwap';
import { Button } from 'components/ui';
import { swapNotification } from 'utils/transactionNotifications';

export const SwapButtonOriginal: FC = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const tokenMap = useTokenMap();

  const { fromMint, toMint, fromAmount } = useSwap();
  const { swap, route } = useSendSwap();
  const canSwap = useCanSwap();

  const fromMarket = useMarket(route && route.markets ? route.markets[0] : undefined);
  const minOrderSize = fromMarket?.minOrderSize ? fromMarket.minOrderSize : 0;

  const fromTokenInfo = tokenMap.get(fromMint.toString());
  const toTokenInfo = tokenMap.get(toMint.toString());

  const isMinAmount = Number(fromAmount) ? Number(fromAmount) >= minOrderSize : false;

  const onSwapClick = async () => {
    setIsExecuting(true);

    const notificationParams = {
      text: `${fromTokenInfo?.symbol} to ${toTokenInfo?.symbol}`,
      symbol: fromTokenInfo?.symbol,
      symbolB: toTokenInfo?.symbol,
    };

    try {
      swapNotification({
        header: 'Swap processing...',
        status: 'processing',
        ...notificationParams,
      });

      await swap();

      swapNotification({
        header: 'Swapped successfuly!',
        status: 'success',
        ...notificationParams,
      });
    } catch (error) {
      console.error('Something wrong with swap:', error);

      swapNotification({
        header: 'Swap didn’t complete!',
        status: 'error',
        ...notificationParams,
        text: (error as Error).message,
      });

      throw error;
    } finally {
      setIsExecuting(false);
    }
  };

  const renderActionText = () => {
    if (isExecuting) {
      return 'Processing...';
    }

    if (!isMinAmount) {
      return `Amount is under min order size ${minOrderSize}`;
    }

    if (route) {
      return 'Swap now';
    }

    if (!fromMint || !toMint) {
      return 'Choose tokens for swap';
    }

    return 'This pair is unavailable';
  };

  const isDisabled = !canSwap || !isMinAmount;

  return (
    <Button primary disabled={isDisabled} big full onClick={onSwapClick}>
      {renderActionText()}
    </Button>
  );
};
