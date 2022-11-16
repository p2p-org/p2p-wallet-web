import type { FC } from 'react';
import { Outlet } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';

import { MainViewModel } from './Main.ViewModel';

export const Main: FC = observer(() => {
  // resolve viewModel
  useViewModel<MainViewModel>(MainViewModel);

  return <Outlet />;
});
