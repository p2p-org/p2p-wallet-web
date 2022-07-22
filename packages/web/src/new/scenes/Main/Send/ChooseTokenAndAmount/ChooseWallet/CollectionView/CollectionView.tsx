import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import type { Wallet } from 'new/sdk/SolanaSDK';
import { StaticSectionsCollectionView } from 'new/ui/components/common/StaticSectionsCollectionView';

import type { ChooseWalletViewModel } from './../ChooseWallet.ViewModel';
import { Cell } from './Cell';

interface Props {
  viewModel: Readonly<ChooseWalletViewModel>;
  onWalletClick: (wallet: Wallet) => void;
}

export const CollectionView: FC<Props> = observer(({ viewModel, onWalletClick }) => {
  return (
    <StaticSectionsCollectionView<Wallet>
      viewModel={viewModel}
      renderPlaceholder={(key) => <Cell key={key} isPlaceholder />}
      renderItem={(wallet: Wallet) => (
        <Cell
          key={wallet.pubkey}
          wallet={wallet}
          isSelected={wallet.pubkey === viewModel.selectedWallet?.pubkey}
          onWalletClick={() => onWalletClick(wallet)}
        />
      )}
    />
  );
});
