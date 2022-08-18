import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Button } from 'components/ui';
import type { SendViewModel } from 'new/scenes/Main/Send';

interface Props {
  viewModel: Readonly<SendViewModel>;
}

export const ActionButton: FC<Props> = observer(({ viewModel }) => {
  return (
    <>
      <Button primary full onClick={() => viewModel.openConfirmModal()}>
        ActionButton
      </Button>
    </>
  );
});
