import type { FC } from 'react';
import { useCallback, useRef, useState } from 'react';
import { useEvent } from 'react-use';

import { styled } from '@linaria/react';
import { shadows, theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { Icon } from 'components/ui';
import type { ChooseWalletViewModel } from 'new/scenes/Main/Send/ChooseTokenAndAmount/ChooseWallet/ChooseWallet.ViewModel';
import { CollectionView } from 'new/scenes/Main/Send/ChooseTokenAndAmount/ChooseWallet/CollectionView';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { TokenAvatar } from 'new/ui/components/common/TokenAvatar';
import { SearchInput } from 'new/ui/components/ui/SearchInput';

const Wrapper = styled.div``;

const SelectorWrapper = styled.div`
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

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;

  width: 24px;
  height: 24px;
  margin-left: 4px;
`;

const ChevronIcon = styled(Icon)`
  color: ${theme.colors.textIcon.secondary};
`;

const TokenWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 8px;

  cursor: pointer;

  &.isOpen {
    ${TokenName}, ${ChevronIcon} {
      color: ${theme.colors.textIcon.active};
    }
  }
`;

const EmptyName = styled.div`
  color: #a3a5ba;
`;

const DropDownListContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  z-index: 1;

  margin-top: 8px;
  padding: 8px 8px 0;
  overflow: hidden;

  background: #fff;
  border-radius: 12px;
  ${shadows.notification}
`;

const DropDownHeader = styled.div`
  padding-bottom: 8px;
`;

const DropDownList = styled.div`
  max-height: 400px;
  padding-bottom: 8px;
  overflow-y: auto;
`;

const TitleTokens = styled.div`
  display: flex;
  align-items: center;
  margin: 0 20px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

interface Props {
  viewModel: Readonly<ChooseWalletViewModel>;
}

export const ChooseWallet: FC<Props> = observer(({ viewModel }) => {
  // const viewModel = useViewModel(ChooseWalletViewModel);

  const selectorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const handleAwayClick = useCallback((e: MouseEvent) => {
    if (
      !selectorRef.current?.contains(e.target as HTMLDivElement) &&
      !dropdownRef.current?.contains(e.target as HTMLDivElement)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEvent('click', handleAwayClick);

  const handleSelectorClick = () => {
    setIsOpen(!isOpen);
  };

  const handleFilterChange = (value: string) => {
    viewModel.search(value.trim());
  };

  const handleWalletClick = (wallet: Wallet) => {
    viewModel.selectWallet(wallet);
    setIsOpen(false);
  };

  return (
    <Wrapper>
      <SelectorWrapper>
        <TokenAvatarWrapper
          className={classNames({ isOpen: isOpen && !viewModel.selectedWallet?.pubkey })}
        >
          {viewModel.selectedWallet?.token ? (
            <TokenAvatar token={viewModel.selectedWallet?.token} size={44} />
          ) : (
            <WalletIcon name="wallet" />
          )}
        </TokenAvatarWrapper>
        <TokenWrapper
          ref={selectorRef}
          onClick={handleSelectorClick}
          className={classNames({ isOpen })}
        >
          <TokenName title={viewModel.selectedWallet?.pubkey ?? undefined}>
            {viewModel.selectedWallet?.token.symbol || <EmptyName>—</EmptyName>}
          </TokenName>
          <ChevronWrapper>
            <ChevronIcon name="arrow-triangle" />
          </ChevronWrapper>
        </TokenWrapper>
      </SelectorWrapper>
      {isOpen ? (
        <DropDownListContainer ref={dropdownRef}>
          <DropDownHeader>
            <SearchInput placeholder="Search for token" onChange={handleFilterChange} />
          </DropDownHeader>
          <DropDownList>
            <CollectionView viewModel={viewModel} onWalletClick={handleWalletClick} />
            {/*{!filteredTokenAccounts?.length ? <Empty type="search" /> : undefined}*/}
          </DropDownList>
        </DropDownListContainer>
      ) : null}
    </Wrapper>
  );
});
