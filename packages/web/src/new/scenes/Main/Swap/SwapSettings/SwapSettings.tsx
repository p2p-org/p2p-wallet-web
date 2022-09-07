import type { FC } from 'react';
import { useMemo } from 'react';
import { generatePath, useParams } from 'react-router';

import { styled } from '@linaria/react';

import { WidgetPageWithBottom } from 'components/common/WidgetPageWithBottom';
import type { SwapRouteParams } from 'components/pages/swap/types';

const Wrapper = styled.div``;

interface Props {}

export const SwapSettings: FC<Props> = (props) => {
  const { symbol } = useParams<SwapRouteParams>();
  const backToPath = useMemo(() => generatePath('/swap/:symbol?', { symbol }), [symbol]);

  return (
    <WidgetPageWithBottom title={['Swap', 'Swap settings']} backTo={backToPath}>
      1
    </WidgetPageWithBottom>
  );
};
