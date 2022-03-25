import { Suspense, useCallback, useContext, useMemo, useState } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import type { LoadableComponent } from '@loadable/component';
import loadable from '@loadable/component';

import type { ModalPropsType } from 'app/contexts/general/modals/types';
import { ModalType } from 'app/contexts/general/modals/types';

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 30;

  width: 100vw;
  height: 100vh;
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

  /* Above background */
  &:last-child {
    z-index: 2;
  }
`;

const ModalWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 10px 0;
`;

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;

  background-color: rgba(0, 0, 0, 0.6);

  user-select: none;
`;

type ModalState = { modalType: ModalType; modalId: number; props: any };

const modalsMap = new Map<ModalType, LoadableComponent<ModalPropsType & any>>([
  // [SHOW_MODAL_ADD_COIN, loadable(() => import('components/modals/__AddCoinModal'))],
  [
    ModalType.SHOW_MODAL_ACTIONS_MOBILE,
    loadable(() => import('components/modals/ActionsMobileModal')),
  ],
  [
    ModalType.SHOW_MODAL_RECEIVE_BITCOIN,
    loadable(() => import('components/modals/ReceiveBitcoinModal')),
  ],
  [
    ModalType.SHOW_MODAL_TRANSACTION_CONFIRM,
    loadable(() => import('components/modals/TransactionConfirmModal')),
  ],
  [
    ModalType.SHOW_MODAL_TRANSACTION_DETAILS,
    loadable(() => import('components/modals/TransactionInfoModals/TransactionDetailsModal')),
  ],
  [
    ModalType.SHOW_MODAL_TRANSACTION_STATUS,
    loadable(() => import('components/modals/TransactionInfoModals/TransactionStatusModal')),
  ],
  [
    ModalType.SHOW_MODAL_CLOSE_TOKEN_ACCOUNT,
    loadable(() => import('components/modals/CloseTokenAccountModal')),
  ],
  [
    ModalType.SHOW_MODAL_PROCEED_USERNAME,
    loadable(() => import('components/modals/ProceedUsernameModal')),
  ],
  [
    ModalType.SHOW_MODAL_CHOOSE_BUY_TOKEN_MOBILE,
    loadable(() => import('components/modals/ChooseBuyTokenMobileModal')),
  ],
  [ModalType.SHOW_MODAL_ERROR, loadable(() => import('components/modals/ErrorModal'))],
]);

const promises = new Map();
let modalId = 0;

const ModalsContext = React.createContext<{
  openModal: <T, S = any>(modalType: ModalType, props?: S) => Promise<T>;
  closeModal: (modalId: number) => void;
  closeTopModal: () => void;
}>({
  openModal: (): Promise<void> => Promise.resolve(),
  closeModal: () => {},
  closeTopModal: () => {},
});

export function ModalsProvider({ children = null as any }) {
  const [modals, setModals] = useState<ModalState[]>([]);

  const openModal = useCallback(async (modalType: ModalType, props?: any): Promise<any> => {
    ++modalId;

    setModals((state) => [
      ...state,
      {
        modalType,
        modalId,
        props,
      },
    ]);

    const promise = new Promise((resolve) => {
      promises.set(modalId, {
        modalId,
        resolve,
      });
    });

    promise.modalId = modalId;

    return promise;
  }, []);

  const closeModal = useCallback((modalId: number, result?: any) => {
    setModals((state) => state.filter((modal) => modal.modalId !== modalId));

    const dialogInfo = promises.get(modalId);
    if (dialogInfo) {
      dialogInfo.resolve(result);
      promises.delete(modalId);
    }

    return result;
  }, []);

  const closeTopModal = useCallback(() => {
    setModals((state) => state.slice(0, state.length - 1));
  }, []);

  const handleWrapperClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // handle click only on element
      if (e.target !== e.currentTarget) {
        return;
      }

      closeTopModal();
    },
    [closeTopModal],
  );

  const preparedModals = useMemo(() => {
    return modals.map((modal) => {
      const ModalComponent = modalsMap.get(modal.modalType);

      if (!ModalComponent) {
        return null;
      }

      return (
        <Suspense fallback={null} key={modalId}>
          <ModalContainer>
            <ModalWrapper onMouseDown={handleWrapperClick}>
              <ModalComponent
                {...modal.props}
                key={modal.modalId}
                close={(result?: any) => closeModal(modal.modalId, result)}
              />
            </ModalWrapper>
          </ModalContainer>
        </Suspense>
      );
    });
  }, [modals, handleWrapperClick, closeModal]);

  return (
    <ModalsContext.Provider
      value={{
        openModal,
        closeModal,
        closeTopModal,
      }}
    >
      {children}
      {preparedModals.length > 0 ? (
        <Wrapper>
          <ModalBackground />
          {preparedModals}
        </Wrapper>
      ) : undefined}
    </ModalsContext.Provider>
  );
}

export function useModals() {
  const { openModal, closeModal, closeTopModal } = useContext(ModalsContext);
  return { openModal, closeModal, closeTopModal };
}
