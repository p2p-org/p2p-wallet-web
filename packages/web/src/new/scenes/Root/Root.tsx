import type { FC } from 'react';
import React from 'react';

import { useViewModel } from 'new/viewmodels/useViewModel';

import { RootViewModel } from './Root.ViewModel';

interface Props {
  children: React.ReactNode;
}

export const Root: FC<Props> = ({ children }) => {
  useViewModel(RootViewModel);

  return <>{children}</>;
};
