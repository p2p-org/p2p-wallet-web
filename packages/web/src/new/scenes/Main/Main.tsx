import type { FC } from 'react';
import React from 'react';

import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';

import { MainViewModel } from './Main.ViewModel';

interface Props {
  children: React.ReactNode;
}

export const Main: FC<Props> = observer(({ children }) => {
  // resolve viewModel
  useViewModel<MainViewModel>(MainViewModel);

  return <>{children}</>;
});
