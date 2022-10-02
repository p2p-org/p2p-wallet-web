import type { FC, LazyExoticComponent } from 'react';
import { lazy, Suspense, useCallback } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { zIndexes } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { ModalType } from 'new/services/ModalService';
import { ScrollFix } from 'new/ui/components/common/ScollFix';

import { ModalManagerViewModel } from './ModalManager.ViewModel';
import type { ModalPropsType } from './types';

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: ${zIndexes.modal};

  background-color: rgba(0, 0, 0, 0.6);

  user-select: none;

  &.nav {
    bottom: 57px;
  }
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;

  overflow-y: auto;
  overscroll-behavior: none;

  &:last-child {
    z-index: 3;
  }
`;

const ModalWrapper = styled(ScrollFix)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
`;

type GetPresetFn = (modal?: ModalType) => Preset;
type Preset = 'nav' | 'regular';

const getPreset: GetPresetFn = (modal) => {
  switch (modal) {
    case ModalType.SHOW_MODAL_ACTIONS_MOBILE:
      return 'nav';
    default:
      return 'regular';
  }
};

const modalsMap = new Map<ModalType, LazyExoticComponent<ModalPropsType & any>>([
  [ModalType.SHOW_MODAL_ACTIONS_MOBILE, lazy(() => import('../ActionsMobileModal'))],
  [ModalType.SHOW_MODAL_RECEIVE_BITCOIN, lazy(() => import('../ReceiveBitcoinModal'))],
  [
    ModalType.SHOW_MODAL_TRANSACTION_CONFIRM,
    lazy(() => import('components/modals/TransactionConfirmModal')),
  ],
  [ModalType.SHOW_MODAL_CONFIRM_SEND, lazy(() => import('../confirmModals/ConfirmSendModal'))],
  [ModalType.SHOW_MODAL_CONFIRM_SWAP, lazy(() => import('../confirmModals/ConfirmSwapModal'))],
  [ModalType.SHOW_MODAL_PROCESS_TRANSACTION, lazy(() => import('../ProcessTransactionModal'))],
  [
    ModalType.SHOW_MODAL_TRANSACTION_DETAILS,
    lazy(() => import('components/modals/TransactionInfoModals/TransactionDetailsModal')),
  ],
  [
    ModalType.SHOW_MODAL_CLOSE_TOKEN_ACCOUNT,
    lazy(() => import('components/modals/CloseTokenAccountModal')),
  ],
  [
    ModalType.SHOW_MODAL_PROCEED_USERNAME,
    lazy(() => import('components/modals/ProceedUsernameModal')),
  ],
  [
    ModalType.SHOW_MODAL_CHOOSE_BUY_TOKEN_MOBILE,
    lazy(() => import('../ChooseBuyTokenMobileModal')),
  ],
  [ModalType.SHOW_MODAL_SELECT_LIST_MOBILE, lazy(() => import('../SelectListMobileModal'))],
  [ModalType.SHOW_MODAL_ERROR, lazy(() => import('components/modals/ErrorModal'))],
]);

export const ModalManager: FC = observer(() => {
  const vm = useViewModel(ModalManagerViewModel);

  const handleWrapperClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // handle click only on element
      if (e.target !== e.currentTarget) {
        return;
      }

      vm.closeTopModal();
    },
    [vm],
  );

  const preparedModals = expr(() => {
    return vm.modals.map((modal) => {
      const ModalComponent = modalsMap.get(modal.modalType);

      if (!ModalComponent) {
        return null;
      }

      return (
        <Suspense fallback={null} key={modal.modalId}>
          <ModalContainer>
            <ModalWrapper onMouseDown={handleWrapperClick}>
              <ModalComponent
                {...modal.props}
                key={modal.modalId}
                close={(result?: unknown) => vm.closeModal(modal.modalId, result)}
              />
            </ModalWrapper>
          </ModalContainer>
        </Suspense>
      );
    });
  });

  if (preparedModals.length === 0) {
    return null;
  }

  const preset = getPreset(vm.modals.at(-1)?.modalType);
  return <Wrapper className={classNames(preset)}>{preparedModals}</Wrapper>;
});
