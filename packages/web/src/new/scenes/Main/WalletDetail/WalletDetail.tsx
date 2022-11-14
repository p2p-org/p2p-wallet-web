import type { FC } from 'react';
import { useLocation } from 'react-router';

import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { useViewModel } from 'new/core/viewmodels';
import { Layout } from 'new/ui/components/common/Layout';
import { truncatingMiddle } from 'new/utils/StringExtensions';

import { History } from './History';
import { QRAddressWidget } from './QRAddressWidget';
import { TopWidget } from './TopWidget';
import { WalletDetailViewModel } from './WalletDetail.ViewModel';

export const WalletDetail: FC = observer(() => {
  const viewModel = useViewModel(WalletDetailViewModel);
  const location = useLocation();

  const currentName = expr(() => {
    if (viewModel.wallet?.token.symbol) {
      return `${viewModel.wallet.token.symbol} Wallet`;
    }

    if (viewModel.pubkey) {
      return `${truncatingMiddle(viewModel.pubkey)} Wallet`;
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
      <QRAddressWidget viewModel={viewModel} />
      <History viewModel={viewModel} />
    </Layout>
  );
});
