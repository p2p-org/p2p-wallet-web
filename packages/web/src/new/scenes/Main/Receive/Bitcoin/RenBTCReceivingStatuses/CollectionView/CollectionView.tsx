import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Cell } from 'new/scenes/Main/Receive/Bitcoin/RenBTCReceivingStatuses/CollectionView/Cell/Cell';
import { CellEmpty } from 'new/scenes/Main/Receive/Bitcoin/RenBTCReceivingStatuses/CollectionView/Cell/CellEmpty';
import type { RenBTCReceivingStatusesViewModel } from 'new/scenes/Main/Receive/Bitcoin/RenBTCReceivingStatuses/RenBTCReceivingStatuses.ViewModel';
import type { LockAndMintProcessingTx } from 'new/sdk/RenVM/actions/LockAndMint';
import { StaticSectionsCollectionView } from 'new/ui/components/common/StaticSectionsCollectionView';

interface Props {
  viewModel: Readonly<RenBTCReceivingStatusesViewModel>;
}

export const CollectionView: FC<Props> = observer(({ viewModel }) => {
  return (
    <StaticSectionsCollectionView<LockAndMintProcessingTx>
      viewModel={viewModel}
      renderPlaceholder={() => null}
      renderItem={(processingTx) => <Cell key={processingTx.tx.txid} processingTx={processingTx} />}
      renderEmpty={(key) => <CellEmpty key={key} />}
    />
  );
});
