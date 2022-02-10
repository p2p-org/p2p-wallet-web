import type { FC } from 'react';
import { useState } from 'react';

import { useIntervalHook } from 'utils/hooks/useIntervalHook';

import { getFormattedHMS } from './utils';

interface Props {
  milliseconds: number;
}

export const HMSCountdown: FC<Props> = ({ milliseconds }) => {
  const [count, setCount] = useState(milliseconds);

  useIntervalHook(() => {
    if (count > 0) {
      setCount((ms) => ms - 1000);
    }
  }, 1000);

  const time = getFormattedHMS(count);

  return <strong>{time}</strong>;
};
