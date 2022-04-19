import { useCallback } from 'react';
import { generatePath, useHistory, useParams } from 'react-router';

import { trackEvent } from 'utils/analytics';

export const useShowSettings = () => {
  const history = useHistory();
  const { symbol } = useParams<SwapRouteParams>();

  const handleShowSettings = useCallback(() => {
    trackEvent('swap_slippage_click');
    history.push(generatePath('/swap/settings/:symbol?', { symbol }));
  }, []);

  return {
    handleShowSettings,
  };
};
