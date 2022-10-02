import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { Accordion } from 'new/ui/components/ui/Accordion';

import { CollectionView } from './CollectionView';
import { RenBTCReceivingStatusesViewModel } from './RenBTCReceivingStatuses.ViewModel';

export const RenBTCReceivingStatuses: FC = observer(() => {
  const viewModel = useViewModel(RenBTCReceivingStatusesViewModel);

  return (
    <Accordion title={'Receiving statuses'} open>
      <CollectionView viewModel={viewModel} />
    </Accordion>
  );
});
