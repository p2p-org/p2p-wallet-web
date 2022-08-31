import type { FC } from 'react';
import { useCallback, useLayoutEffect, useRef } from 'react';
import * as React from 'react';
import { useEvent } from 'react-use';

import { styled } from '@linaria/react';
import { shadows, theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { Icon } from 'components/ui';
import type { ChooseWalletViewModel } from 'new/scenes/Main/Send/ChooseWallet/ChooseWallet.ViewModel';
import { CollectionView } from 'new/scenes/Main/Send/ChooseWallet/CollectionView';
import type { Wallet } from 'new/sdk/SolanaSDK';
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

interface Props {
  viewModel: Readonly<ChooseWalletViewModel>;
  selector: React.ReactNode;
  selectedWallet: Wallet | null;
  showOtherWallets: boolean;
  onWalletChange: (wallet: Wallet) => void;
}

export const ChooseWallet: FC<Props> = observer(
  ({ viewModel, selector, selectedWallet, showOtherWallets, onWalletChange }) => {
    const selectorRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
      viewModel.selectWallet(selectedWallet);
      viewModel.setShowOtherWallets(showOtherWallets);
    }, [selectedWallet, showOtherWallets, viewModel]);

    const handleAwayClick = useCallback(
      (e: MouseEvent) => {
        if (
          !selectorRef.current?.contains(e.target as HTMLDivElement) &&
          !dropdownRef.current?.contains(e.target as HTMLDivElement)
        ) {
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
          className={classNames({ isOpen: viewModel.isOpen })}
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