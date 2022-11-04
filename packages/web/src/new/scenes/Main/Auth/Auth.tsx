import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Wizard } from './Subviews/Wizard';

export const Auth: FC = observer(() => {
  return <Wizard />;
});
