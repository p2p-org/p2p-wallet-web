import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { Icon } from 'components/ui';
import type { ChooseWalletViewModel } from 'new/scenes/Main/Send/ChooseWallet/ChooseWallet.ViewModel';
import { TokenAvatar } from 'new/ui/components/common/TokenAvatar';

const Wrapper = styled.div`
  display: flex;
`;

const WalletIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const TokenAvatarWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: #f6f6f8;
  border-radius: 12px;

  &.isOpen {
    background: #5887ff;

    ${WalletIcon} {
      color: #fff;
    }
  }
`;

const TokenName = styled.div`
  max-width: 200px;
  overflow: hidden;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 20px;
  line-height: 100%;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const TokenWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 8px;

  &.isOpen {
    ${TokenName} {
      color: ${theme.colors.textIcon.active};
    }
  }
`;

const EmptyName = styled.div`
  color: #a3a5ba;
`;

interface Props {
  viewModel: Readonly<ChooseWalletViewModel>;
}

export const WalletSelectorContent: FC<Props> = observer(({ viewModel }) => {
  return (
    <Wrapper>
      <TokenAvatarWrapper
        className={classNames({ isOpen: viewModel.isOpen && !viewModel.selectedWallet?.pubkey })}
      >
        {viewModel.selectedWallet?.token ? (
          <TokenAvatar token={viewModel.selectedWallet?.token} size={44} />
        ) : (
          <WalletIcon name="wallet" />
        )}
      </TokenAvatarWrapper>
      <TokenWrapper className={classNames({ isOpen: viewModel.isOpen })}>
        <TokenName title={viewModel.selectedWallet?.pubkey ?? undefined}>
          {viewModel.selectedWallet?.token.symbol || <EmptyName>—</EmptyName>}
        </TokenName>
      </TokenWrapper>
    </Wrapper>
  );
});
