import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels';

import { AuthViewModel } from './Auth.ViewModel';
import Wizard from './Subviews/Wizard';

export const Auth: FC = observer(() => {
  const authViewModel = useViewModel(AuthViewModel);

  return <Wizard authViewModel={authViewModel} />;
});
