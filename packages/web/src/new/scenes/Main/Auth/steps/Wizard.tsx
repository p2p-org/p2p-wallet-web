import type { FC } from 'react';

import type { ViewMap, WizardPayload } from 'new/scenes/Main/Auth/typings';
import { WizardSteps } from 'new/scenes/Main/Auth/typings';

import { ChooseFlow } from './ChooseFlow';

export interface Props {
  step: WizardSteps;
  onChange: (payload: WizardPayload) => void;
}

const VIEW_MAP: ViewMap = {
  [WizardSteps.CHOOSE_FLOW]: <ChooseFlow />,
};

export const Wizard: FC<Props> = (props) => {
  const elView = VIEW_MAP[props.step];

  return <>{elView}</>;
};

export default Wizard;
