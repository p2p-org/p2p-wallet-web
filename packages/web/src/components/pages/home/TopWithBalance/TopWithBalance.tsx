import type { FunctionComponent } from 'react';

import { useIsMobile } from '@p2p-wallet-web/ui';

import { Desktop } from './Desktop';
import { Mobile } from './Mobile';

type Props = {};

export const TopWithBalance: FunctionComponent<Props> = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <Mobile />;
  }

  return <Desktop />;
};
