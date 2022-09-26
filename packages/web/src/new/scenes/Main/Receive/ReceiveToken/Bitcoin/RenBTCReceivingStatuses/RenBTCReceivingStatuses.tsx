import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Accordion } from 'new/ui/components/ui/Accordion';

import { CollectionView } from './CollectionView';
import type { RenBTCReceivingStatusesViewModel } from './RenBTCReceivingStatuses.ViewModel';

interface Props {
  viewModel: Readonly<RenBTCReceivingStatusesViewModel>;
}

export const RenBTCReceivingStatuses: FC<Props> = observer(({ viewModel }) => {
  return (
    <Accordion title={'Receiving statuses'} open>
      <CollectionView viewModel={viewModel} />
    </Accordion>
  );
});
