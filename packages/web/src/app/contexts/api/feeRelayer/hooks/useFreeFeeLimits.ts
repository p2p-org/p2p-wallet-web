import { useEffect, useState } from 'react';

import { useFeeRelayer } from '..';
import { INITIAL_USER_FREE_FEE_LIMITS } from '../utils';

export const useFreeFeeLimits = () => {
  const { getUserFreeFeeLimits } = useFeeRelayer();
  const [userFreeFeeLimits, setUserFreeFeeLimits] = useState(INITIAL_USER_FREE_FEE_LIMITS);

  useEffect(() => {
    const fetchLimits = async () => {
      const limits = await getUserFreeFeeLimits();
      setUserFreeFeeLimits(limits);
    };

    void fetchLimits();
  }, [getUserFreeFeeLimits]);

  return { userFreeFeeLimits };
};
