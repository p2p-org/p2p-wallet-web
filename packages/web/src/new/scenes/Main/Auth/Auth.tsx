import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { AuthVewModel } from 'new/scenes/Main/Auth/Auth.VewModel';

import { Wizard } from './Subviews/Steps/Wizard';

export const Auth: FC = observer(() => {
  const viewModel = useViewModel(AuthVewModel);

  return <Wizard step={viewModel.step} onChange={viewModel.onWizardChange} />;
});
