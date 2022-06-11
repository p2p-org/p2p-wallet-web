import type { FC } from 'react';
import React from 'react';

import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/viewmodels/useViewModel';

import { MainViewModel } from './Main.ViewModel';

interface Props {
  children: React.ReactNode;
}

export const Main: FC<Props> = observer(({ children }) => {
  const vm = useViewModel<MainViewModel>(MainViewModel);

  return <>{children}</>;
});
