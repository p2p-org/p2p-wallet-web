import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import type { ProcessingTx } from 'new/sdk/RenVM';
import { StaticSectionsCollectionView } from 'new/ui/components/common/StaticSectionsCollectionView';

import type { RenBTCReceivingStatusesViewModel } from '../RenBTCReceivingStatuses.ViewModel';
import { Cell } from './Cell';

interface Props {
  viewModel: Readonly<RenBTCReceivingStatusesViewModel>;
}

export const CollectionView: FC<Props> = observer(({ viewModel }) => {
  return (
    <StaticSectionsCollectionView<ProcessingTx>
      viewModel={viewModel}
      renderItem={(processingTx) => <Cell key={processingTx.tx.txid} processingTx={processingTx} />}
    />
  );
});
