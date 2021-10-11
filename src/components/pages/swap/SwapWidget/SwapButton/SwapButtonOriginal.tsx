import React, { FC, useMemo, useState } from 'react';

import { useSwap } from 'app/contexts/swapSerum';
import { useMinOrder } from 'app/contexts/swapSerum/dex';
import { useCanSwap } from 'app/contexts/swapSerum/swap';
import { useTokenMap } from 'app/contexts/swapSerum/tokenList';
import { useSendSwap } from 'components/pages/swap/SwapWidget/SwapButton/hooks/useSendSwap';
import { Button } from 'components/ui';
import { swapNotification } from 'utils/transactionNotifications';

export const SwapButtonOriginal: FC = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const tokenMap = useTokenMap();

  const { fromMint, toMint } = useSwap();
  const { swap, route } = useSendSwap();
  const { minOrderSize, isMinOrderSize } = useMinOrder();
  const canSwap = useCanSwap();

  const fromTokenInfo = tokenMap.get(fromMint.toString());
  const toTokenInfo = tokenMap.get(toMint.toString());

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
      console.error('Something wrong with swap:', error.toString());

      swapNotification({
        header: 'Swap didn’t complete!',
        status: 'error',
        ...notificationParams,
        text: (error as Error).toString(),
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const renderActionText = useMemo(() => {
    if (isExecuting) {
      return 'Processing...';
    }

    if (!isMinOrderSize) {
      return `Amount is under min order size ${minOrderSize}`;
    }

    if (route) {
      return 'Swap now';
    }

    if (!fromMint || !toMint) {
      return 'Choose tokens for swap';
    }

    return 'This pair is unavailable';
  }, [fromMint, isExecuting, isMinOrderSize, minOrderSize, route, toMint]);

  const isDisabled = !canSwap || !isMinOrderSize;

  return (
    <Button primary disabled={isDisabled} big full onClick={onSwapClick}>
      {renderActionText}
    </Button>
  );
};
