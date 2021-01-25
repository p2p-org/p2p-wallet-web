import { Action, ActionCreator, ThunkAction } from '@reduxjs/toolkit';
import { openModal as openModalRedux } from 'redux-modals-manager';

import { RootState } from 'store/rootReducer';
import { DuplicateModalError } from 'utils/errors';

export const openModal: ActionCreator<ThunkAction<Action, RootState, null, Action>> = (
  modalType: string,
  props?: any,
) => (dispatch, getState) => {
  const { modals } = getState();

  if (modals.some(({ type }) => type === modalType)) {
    throw new DuplicateModalError(`Dublicate of modal ${modalType}`);
  }

  return dispatch(openModalRedux(modalType, props));
};
