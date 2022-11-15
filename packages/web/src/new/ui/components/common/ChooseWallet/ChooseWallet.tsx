import type { FC } from 'react';
import { useCallback, useLayoutEffect, useRef } from 'react';
import * as React from 'react';
import { useEvent } from 'react-use';

import { styled } from '@linaria/react';
import { shadows, theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { Icon } from 'components/ui';
import type { Wallet } from 'new/sdk/SolanaSDK';
import type { ChooseWalletViewModel } from 'new/ui/components/common/ChooseWallet/ChooseWallet.ViewModel';
import { CollectionView } from 'new/ui/components/common/ChooseWallet/CollectionView';
import { SearchInput } from 'new/ui/components/ui/SearchInput';

const ChevronIcon = styled(Icon)`
  color: ${theme.colors.textIcon.secondary};
`;

const SelectorWrapper = styled.div`
  display: flex;
  align-items: center;

  cursor: pointer;

  &.isOpen {
    ${ChevronIcon} {
      color: ${theme.colors.textIcon.active};
    }
  }
`;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;

  width: 24px;
  height: 24px;
  margin-left: 4px;
`;

const DropDownListContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  z-index: 2;

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

interface Props {
  viewModel: Readonly<ChooseWalletViewModel>;
  selector: React.ReactNode;
  selectedWallet: Wallet | null;
  customFilter?: (wallet: Wallet) => boolean;
  staticWallets?: Wallet[] | null;
  showOtherWallets: boolean;
  onWalletChange: (wallet: Wallet) => void;
  className?: string;
}

export const ChooseWallet: FC<Props> = observer(
  ({
    viewModel,
    selector,
    selectedWallet,
    customFilter,
    staticWallets = null,
    showOtherWallets,
    onWalletChange,
    className,
  }) => {
    const selectorRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
      viewModel.selectWallet(selectedWallet);
      viewModel.setCustomFilter(customFilter);
      viewModel.setStaticWallets(staticWallets);
      viewModel.setShowOtherWallets(showOtherWallets);
      viewModel.reload();
    }, [customFilter, selectedWallet, showOtherWallets, viewModel]);

    const handleAwayClick = useCallback(
      (e: MouseEvent) => {
        if (
          !selectorRef.current?.contains(e.target as HTMLDivElement) &&
          !dropdownRef.current?.contains(e.target as HTMLDivElement)
        ) {
          viewModel.clearSearching();
          viewModel.setIsOpen(false);
        }
      },
      [viewModel],
    );

    useEvent('click', handleAwayClick);

    const handleSelectorClick = () => {
      viewModel.setIsOpen(!viewModel.isOpen);
    };

    const handleFilterChange = (value: string) => {
      viewModel.search(value.trim());
    };

    const handleWalletClick = (wallet: Wallet) => {
      onWalletChange(wallet);
      viewModel.setIsOpen(false);
    };

    return (
      <>
        <SelectorWrapper
          ref={selectorRef}
          onClick={handleSelectorClick}
          className={classNames(className, { isOpen: viewModel.isOpen })}
        >
          {selector}
          <ChevronWrapper>
            <ChevronIcon name="arrow-triangle" />
          </ChevronWrapper>
        </SelectorWrapper>
        {viewModel.isOpen ? (
          <DropDownListContainer ref={dropdownRef}>
            <DropDownHeader>
              <SearchInput
                placeholder="Search for token"
                initialValue={viewModel.keyword}
                onChange={handleFilterChange}
              />
            </DropDownHeader>
            <DropDownList>
              <CollectionView viewModel={viewModel} onWalletClick={handleWalletClick} />
            </DropDownList>
          </DropDownListContainer>
        ) : null}
      </>
    );
  },
);
