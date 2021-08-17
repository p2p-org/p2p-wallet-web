import { createAsyncThunk } from '@reduxjs/toolkit';
import { openModal as openModalRedux } from 'redux-modals-manager';

import { RootState } from 'store/rootReducer';
import { DuplicateModalError } from 'utils/errors';

export const openModal = createAsyncThunk<any, { modalType: string; props?: any }>(
  `openModal`,
  (arg, thunkAPI) => {
    const { modals } = thunkAPI.getState() as RootState;

    if (modals.some(({ type }) => type === arg.modalType)) {
      throw new DuplicateModalError(`Dublicate of modal ${arg.modalType}`);
    }

    return thunkAPI.dispatch(openModalRedux(arg.modalType, arg.props));
  },
);
