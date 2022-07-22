import type { FunctionComponent } from 'react';

import { useIsMobile } from '@p2p-wallet-web/ui';

import type { HomeViewModel } from 'new/scenes/Main/Home';

import { Desktop } from './Desktop';
import { Mobile } from './Mobile';

type Props = {
  viewModel: Readonly<HomeViewModel>;
};

export const Header: FunctionComponent<Props> = ({ viewModel }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <Mobile viewModel={viewModel} />;
  }

  return <Desktop viewModel={viewModel} />;
};
