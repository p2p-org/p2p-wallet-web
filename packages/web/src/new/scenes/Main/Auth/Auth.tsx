import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';

import { AuthViewModel } from './Auth.ViewModel';
import { Wizard } from './Subviews/Wizard';

export const Auth: FC = observer(() => {
  const viewModel = useViewModel(AuthViewModel);

  return <Wizard step={viewModel.step} />;
});
