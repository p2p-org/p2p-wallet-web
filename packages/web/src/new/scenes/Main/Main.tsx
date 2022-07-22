import type { FC } from 'react';
import React, { useEffect } from 'react';

import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';

import { MainViewModel } from './Main.ViewModel';

interface Props {
  children: React.ReactNode;
}

export const Main: FC<Props> = observer(({ children }) => {
  const viewModel = useViewModel<MainViewModel>(MainViewModel);

  useEffect(() => {
    viewModel.walletsRepository.reload();
  }, [viewModel.walletsRepository]);

  return <>{children}</>;
});
