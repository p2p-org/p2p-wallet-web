import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { CollectionView } from 'new/scenes/Main/Receive/Bitcoin/RenBTCReceivingStatuses/CollectionView';
import { RenBTCReceivingStatusesViewModel } from 'new/scenes/Main/Receive/Bitcoin/RenBTCReceivingStatuses/RenBTCReceivingStatuses.ViewModel';
import { Accordion } from 'new/ui/components/ui/Accordion';

export const RenBTCReceivingStatuses: FC = observer(() => {
  const viewModel = useViewModel(RenBTCReceivingStatusesViewModel);

  return (
    <Accordion title={'Receiving statuses'} open>
      <CollectionView viewModel={viewModel} />
    </Accordion>
  );
});
