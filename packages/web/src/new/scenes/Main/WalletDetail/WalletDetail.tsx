import type { FC } from 'react';
import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { QRAddressWidget } from 'components/common/QRAddressWidget';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { Layout } from 'new/ui/components/common/Layout';
import { shortAddress } from 'utils/tokens';

import { History } from './History';
import { TopWidget } from './TopWidget';
import { WalletDetailViewModel } from './WalletDetail.ViewModel';

export const WalletDetail: FC = observer(() => {
  const viewModel = useViewModel(WalletDetailViewModel);
  // TODO: temp
  const { publicKey } = useParams<{ publicKey: string }>();

  const currentName = expr(() => {
    if (viewModel.wallet?.token.symbol) {
      return `${viewModel.wallet.token.symbol} Wallet`;
    }

    if (viewModel.pubkey) {
      return `${shortAddress(viewModel.pubkey)} Wallet`;
    }

    return '';
  });

  return (
    <Layout
      breadcrumb={{
        currentName,
        backTo: {
          pathname: `/wallets`,
          state: { fromPage: location.pathname },
        },
      }}
    >
      <TopWidget viewModel={viewModel} />
      {/* TODO: temp */}
      <QRAddressWidget publicKey={publicKey} />
      <History wallet={viewModel.wallet} />
    </Layout>
  );
});
