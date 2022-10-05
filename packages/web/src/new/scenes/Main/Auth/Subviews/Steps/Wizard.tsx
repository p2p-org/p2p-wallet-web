import type { FC } from 'react';

import type { ViewMap } from 'new/scenes/Main/Auth/typings';
import { WizardSteps } from 'new/scenes/Main/Auth/typings';

import { CreateMnemonic } from './CreateMnemonic';

export interface Props {
  step: WizardSteps;
}

export const Wizard: FC<Props> = (props) => {
  const VIEW_MAP: ViewMap = {
    [WizardSteps.CREATE_START]: <CreateMnemonic />,
    [WizardSteps.RESTORE_START]: <p>slkdf</p>,
  };

  const elView = VIEW_MAP[props.step];

  return <>{elView}</>;
};

export default Wizard;
