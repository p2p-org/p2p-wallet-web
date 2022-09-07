import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import type { SendViewModel } from 'new/scenes/Main/Send';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { ChooseWallet } from 'new/ui/components/common/ChooseWallet';

import { WalletSelectorContent } from './WalletSelectorContent';

const Wrapper = styled.div`
  position: relative;
`;

interface Props {
  viewModel: Readonly<SendViewModel>;
}

export const FeeView: FC<Props> = observer(({ viewModel }) => {
  const handleWalletChange = (wallet: Wallet) => {
    viewModel.selectPayingWallet(wallet);
  };

  return (
    <Wrapper>
      <ChooseWallet
        viewModel={viewModel.choosePayingWalletViewModel}
        selector={<WalletSelectorContent viewModel={viewModel} />}
        selectedWallet={viewModel.payingWallet}
        showOtherWallets={false}
        onWalletChange={handleWalletChange}
      />
    </Wrapper>
  );
});
