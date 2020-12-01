import { openModal as openModalRedux } from 'redux-modals-manager';

import { AppThunk } from 'store/types';
import { DuplicateModalError } from 'utils/errors';

export const openModal = (modalType: string, params?: any): AppThunk => (dispatch, getState) => {
  const { modals } = getState();

  if (modals.some(({ type }) => type === modalType)) {
    throw new DuplicateModalError();
  }

  return dispatch(openModalRedux(modalType, params));
};
