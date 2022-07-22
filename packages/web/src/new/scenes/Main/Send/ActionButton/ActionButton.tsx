import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Button } from 'components/ui';

interface Props {}

export const ActionButton: FC<Props> = observer((props) => {
  return (
    <Button primary full>
      ActionButton
    </Button>
  );
});
