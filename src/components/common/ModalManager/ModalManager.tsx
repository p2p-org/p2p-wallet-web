import React, { createRef, FunctionComponent, RefObject, Suspense, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import loadable, { LoadableComponent } from '@loadable/component';
import { last } from 'ramda';
import { closeModal, ModalComponentType, ModalState } from 'redux-modals-manager';

import {
  SHOW_MODAL_ADD_COIN,
  SHOW_MODAL_CLOSE_TOKEN_ACCOUNT,
  SHOW_MODAL_ERROR,
  SHOW_MODAL_PROCEED_USERNAME,
  SHOW_MODAL_TRANSACTION_CONFIRM,
  SHOW_MODAL_TRANSACTION_DETAILS,
  SHOW_MODAL_TRANSACTION_STATUS,
} from 'store/constants/modalTypes';
import { RootState } from 'store/rootReducer';

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

// TODO: types
const modalsMap = new Map<string, LoadableComponent<any>>([
  [SHOW_MODAL_ADD_COIN, loadable(() => import('components/modals/AddCoinModal'))],
  [
    SHOW_MODAL_TRANSACTION_CONFIRM,
    loadable(() => import('components/modals/TransactionConfirmModal')),
  ],
  [
    SHOW_MODAL_TRANSACTION_DETAILS,
    loadable(() => import('components/modals/TransactionInfoModals/TransactionDetailsModal')),
  ],
  [
    SHOW_MODAL_TRANSACTION_STATUS,
    loadable(() => import('components/modals/TransactionInfoModals/TransactionStatusModal')),
  ],
  [
    SHOW_MODAL_CLOSE_TOKEN_ACCOUNT,
    loadable(() => import('components/modals/CloseTokenAccountModal')),
  ],
  [SHOW_MODAL_PROCEED_USERNAME, loadable(() => import('components/modals/ProceedUsernameModal'))],
  [SHOW_MODAL_ERROR, loadable(() => import('components/modals/ErrorModal'))],
]);

export const ModalManager: FunctionComponent = () => {
  const dispatch = useDispatch();
  const [modalsRefs, setModalsRefs] = useState<{
    [modalId: string]: RefObject<ModalComponentType>;
  }>({});
  const modals = useSelector((state: RootState) => state.modals);

  const closeTopModal = async () => {
    const { modalId } = last(modals) || {};

    if (!modalId) {
      return;
    }

    const modalRef = modalsRefs[modalId];

    if (modalRef && modalRef.current && modalRef.current.canClose) {
      if (!(await modalRef.current.canClose())) {
        return;
      }
    }

    dispatch(closeModal(modalId));
  };

  const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // handle click only on element
    if (e.target !== e.currentTarget) {
      return;
    }

    void closeTopModal();
  };

  const getReadyDialogs = () => {
    const dialogs: (ModalState & {
      ModalComponent: LoadableComponent<any>;
    })[] = [];

    for (const { type, modalId, props } of modals) {
      const ModalComponent = modalsMap.get(type);
      if (ModalComponent) {
        dialogs.push({
          type,
          modalId,
          props,
          ModalComponent,
        });
      }
    }

    return dialogs;
  };

  const dialogsInfo = getReadyDialogs();

  const dialogs = dialogsInfo.map(({ modalId, props, ModalComponent }) => {
    let modalRef = modalsRefs[modalId];

    if (!modalRef) {
      modalRef = createRef();
      setModalsRefs((state) => ({
        ...state,
        [modalId]: modalRef,
      }));
    }

    return (
      <Suspense fallback={null} key={modalId}>
        <ModalContainer>
          <ModalWrapper onMouseDown={handleWrapperClick}>
            <ModalComponent
              {...props}
              modalId={modalId}
              modalRef={modalRef}
              close={(result: any) => dispatch(closeModal(modalId, result))}
            />
          </ModalWrapper>
        </ModalContainer>
      </Suspense>
    );
  });

  if (dialogs.length > 0) {
    return (
      <Wrapper>
        <ModalBackground />
        {dialogs}
      </Wrapper>
    );
  }

  return null;
};
