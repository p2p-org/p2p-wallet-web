import { useMemo } from 'react';
import { generatePath, useParams, useRouteMatch } from 'react-router';

import { WidgetPage } from 'components/common/WidgetPage';

import type { SwapRouteParams } from '../types';

export const SwapSlippageWidget = () => {
  const { symbol } = useParams<SwapRouteParams>();
  const match = useRouteMatch();

  const backToPath = useMemo(() => generatePath('/swap/:symbol?', { symbol }), []);

  return <WidgetPage title={['Swap', 'Swap settings']} backTo={backToPath}></WidgetPage>;
};
